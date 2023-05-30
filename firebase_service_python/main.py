import logging
import sys
import time
import uuid
from concurrent import futures
from datetime import datetime, timedelta

import firebase_admin
import google
import grpc
from firebase_admin import firestore, credentials
from google.cloud.firestore_v1 import DocumentSnapshot
from google.protobuf import timestamp_pb2
from google.protobuf.timestamp_pb2 import Timestamp
from proto.datetime_helpers import DatetimeWithNanoseconds

from Protos import order_pb2, order_pb2_grpc, scheduler_pb2_grpc, scheduler_pb2

cred = credentials.Certificate("authToken.json")
app = firebase_admin.initialize_app(cred)
db = firestore.client()

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s %(name)-12s %(levelname)-8s %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)


def get_current_timestamp():
    now = datetime.utcnow()
    timestamp = timestamp_pb2.Timestamp()
    timestamp.FromDatetime(now)
    return timestamp


def get_seat_and_movie_index_and_aud_by_seat_num_auditorium_movie_date_and_movie_timestamp(seat_num, auditorium_num,
                                                                                           movie_date, movie_timestamp):
    try:
        auditorium = db.collection('auditorium').where('auditorium_num', '==', auditorium_num).get()[0]
        logging.debug("timestamp: " + str(movie_timestamp))
        seconds = movie_timestamp.seconds
        formatted_movie_time = datetime.fromtimestamp(seconds)
        try:
            schedule = auditorium.to_dict()['schedules'][movie_date]
        except KeyError:
            logging.debug("Movie date not found!")
            return None, None, None
        schedule = list(schedule)
        event = None
        movie_index = None
        for i in range(len(schedule)):
            dt = schedule[i]['start_time']
            logging.debug(dt)
            formatted_time = datetime.fromtimestamp(dt.timestamp())
            formatted_time = formatted_time.replace(microsecond=formatted_movie_time.microsecond)
            if formatted_time == formatted_movie_time:
                event = schedule[i]
                movie_index = i
                break
        if event is None:
            logging.debug("Event not found!")
            return None, None, None
        seats_raw = event['seats']
        seats = []
        for s in seats_raw:
            seats.append(s.get())
        if len(seats) > 0:
            for s in seats:
                logging.debug(s)
                if s.to_dict()['seat_num'] == seat_num:
                    return s, movie_index, auditorium
    except Exception as e:
        logging.error("Error: ", exc_info=True)
        return None, None, None
    logging.debug("Seat not found!")
    return None, None, None


def raw_tickets_to_ticket_stubs(tickets):
    ticket_stubs = []
    for ticket in tickets:
        tdoc = ticket.get()
        aud_doc = tdoc.to_dict()['auditorium'].get()
        schedule = aud_doc.to_dict()['schedules'][tdoc.to_dict()['movie_date']][tdoc.to_dict()['movie_index']]
        seat_doc = tdoc.to_dict()["seat"].get()
        seat_num = seat_doc.to_dict()['seat_num']
        print("Ticket Stub: " + str(schedule['movie_uuid']) + " " + str(
            aud_doc.to_dict()['auditorium_num']) + " " + str(schedule['start_time']) + " " + str(seat_num))

        ticket_stubs.append(order_pb2.TicketStub(
            movie_uuid=schedule['movie_uuid'],
            theater_room=aud_doc.to_dict()['auditorium_num'],
            movie_time=str(schedule['start_time']),
            seat_num=seat_num,
        ))
    return ticket_stubs


class GreeterServicer(order_pb2_grpc.OrderServiceServicer):
    def GetOrder(self, request, context):
        print("getting order: " + request.uuid)
        doc_ref = db.collection('orders').document(request.uuid.replace('-', ''))
        doc = doc_ref.get()
        tickets_raw = doc.to_dict()['tickets']
        ticket_stubs = raw_tickets_to_ticket_stubs(tickets_raw)

        if doc.exists:
            # put the dashes back in the guids
            formatted_user_guid = doc.to_dict()['user_uuid'][:8] + '-' + doc.to_dict()['user_uuid'][8:12] + '-' + \
                                  doc.to_dict()['user_uuid'][12:16] + '-' + doc.to_dict()['user_uuid'][16:20] + '-' + \
                                  doc.to_dict()['user_uuid'][20:]
            formatted_guid = doc.to_dict()['uuid'][:8] + '-' + doc.to_dict()['uuid'][8:12] + '-' + doc.to_dict()[
                                                                                                       'uuid'][
                                                                                                   12:16] + '-' + \
                             doc.to_dict()['uuid'][16:20] + '-' + doc.to_dict()['uuid'][20:]
            logging.debug("Order time obj" + str(doc.to_dict()['date_created']))
            dt = datetime.fromtimestamp(doc.to_dict()['date_created'].timestamp())
            timestamp = timestamp_pb2.Timestamp()
            timestamp = timestamp.FromDatetime(dt)
            return order_pb2.Order(
                uuid=formatted_guid,
                user_uuid=formatted_user_guid,
                tickets=ticket_stubs,
                is_paid=order_pb2.IsPaid(is_paid=doc.to_dict()['isPaid']),
                date_created=timestamp,
            )
        else:
            context.set_code(grpc.StatusCode.NOT_FOUND)
            context.set_details('Order not found!')
            return order_pb2.Order()

    def CreateOrder(self, request, context):
        try:
            date_created = get_current_timestamp()
            orderid = uuid.uuid4().hex
            order_doc_ref = db.collection('orders').document(orderid)
            tickets = []
            for seat_num in request.seat_num:
                ticket_uuid = uuid.uuid4().hex
                seat, movie_index, aud = get_seat_and_movie_index_and_aud_by_seat_num_auditorium_movie_date_and_movie_timestamp(
                    seat_num, request.theater_room, request.movie_date, request.movie_time)
                if seat is None:
                    context.set_code(grpc.StatusCode.NOT_FOUND)
                    context.set_details('Seat not found!')
                    return order_pb2.Order()
                # ds = DocumentSnapshot.reference
                logging.debug("Seat: " + str(seat.reference))
                ticket_doc_ref = db.collection('ticket').document(ticket_uuid)
                ticket_doc_ref.set({
                    'uuid': ticket_uuid,
                    'user_uuid': request.user_uuid,
                    'seat': seat.reference,
                    'order_uuid': orderid,
                    'movie_index': movie_index,
                    'movie_date': request.movie_date,
                    'auditorium': aud.reference
                })
                tickets.append(ticket_doc_ref)
                print("Ticket: " + str(ticket_doc_ref.get().to_dict()))
            ticket_stubs = raw_tickets_to_ticket_stubs(tickets)
            order_doc_ref.set({
                'uuid': orderid,
                'user_uuid': request.user_uuid,
                'tickets': tickets,
                'isPaid': False,
                'date_created': date_created.ToDatetime()
            })
            context.set_code(grpc.StatusCode.OK)
            return order_pb2.Order(
                uuid=orderid,
                user_uuid=request.user_uuid,
                tickets=ticket_stubs,
                is_paid=order_pb2.IsPaid(is_paid=False),
                date_created=date_created
            )
        except Exception as e:
            logging.error("Error! ", exc_info=True)
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details('Error! ' + str(e))
            return order_pb2.Order()

    def GetOrdersByUserId(self, request, context):
        logging.debug("Getting orders for user: " + request.uuid)
        docs = db.collection('orders').where('user_uuid', '==', request.uuid).stream()
        if docs is None:
            context.set_code(grpc.StatusCode.NOT_FOUND)
            context.set_details('No orders found for user!')
            return order_pb2.Order()
        returns = []
        logging.debug("Found orders: " + str(docs))
        for doc in docs:
            dt = doc.to_dict()['date_created'].timestamp()
            timestamp = timestamp_pb2.Timestamp()
            logging.debug("Order time obj" + str(dt))
            ticket_stubs = raw_tickets_to_ticket_stubs(doc.to_dict()['tickets'])
            print(doc.to_dict())
            returns.append(order_pb2.Order(
                uuid=doc.to_dict()['uuid'],
                user_uuid=doc.to_dict()['user_uuid'],
                tickets=ticket_stubs,
                is_paid=order_pb2.IsPaid(is_paid=doc.to_dict()['isPaid']),
                date_created=timestamp
            ))
        return order_pb2.Orders(order_list=returns)

    def DeleteOrder(self, request, context):
        order_to_delete = db.collection('orders').document(request.uuid).get()
        if not order_to_delete.exists:
            context.set_code(grpc.StatusCode.NOT_FOUND)
            context.set_details('Order not found!')
            return order_pb2.Order()
        logging.debug("Order to delete: " + str(order_to_delete.to_dict()))
        tickets_to_delete = order_to_delete.to_dict()['tickets']
        for ticket in tickets_to_delete:
            ticket.delete()
        db.collection('orders').document(request.uuid).delete()
        return google.protobuf.empty_pb2.Empty()


def seat_generator(auditorium):
    alphabet = "abcdefghijklmnopqrstuvwxyz"
    seats = []
    aud_layout = auditorium.to_dict()['layout'].get()
    for row in range(aud_layout.to_dict()['rows']):
        for col in range(aud_layout.to_dict()['seats_per_row']):
            seat_uuid = uuid.uuid4().hex
            seat_doc_ref = db.collection('seats').document(seat_uuid)
            seat_doc_ref.set({
                'seat_num': str(alphabet[col]) + str(col),
                'auditorium': auditorium.reference,
                'status': scheduler_pb2.Status.Value("Available"),
                'user': None,
                'uuid': seat_uuid,
            })
            seats.append(seat_doc_ref)
    return seats


class SchedulerServicer(scheduler_pb2_grpc.MovieScheduleServiceServicer):
    def AddMovieToSchedule(self, request, context):
        aud_num = int(request.auditorium_num)
        aud = db.collection('auditorium').where("auditorium_num", "==", aud_num).get()[0]
        date = request.time
        dt = date.ToDatetime(tzinfo=None)
        logging.debug("Date: " + str(dt))
        # format date mm/dd/yyyy
        date = dt.strftime("%m/%d/%Y")

        aud_schedule = aud.to_dict()['schedules']
        if date not in aud_schedule:
            aud_schedule[date] = []
        # check if schedule has a movie with a time that overlaps with the new movie
        for sched in aud_schedule[date]:
            if sched['start_time'].replace(tzinfo=None) <= dt <= sched['end_time'].replace(tzinfo=None):
                context.set_code(grpc.StatusCode.ALREADY_EXISTS)
                context.set_details('Movie already scheduled at this time!')
                return scheduler_pb2.Schedule()
        seats = seat_generator(aud)
        aud_schedule[date].append({
            'movie_uuid': request.movie_uuid,
            'start_time': dt,
            'end_time': dt + timedelta(minutes=180),
            'seats': seats
        })
        aud.reference.update({
            'schedules': aud_schedule
        })
        # add three hours to dt
        dt = dt + timedelta(minutes=180)
        return scheduler_pb2.Schedule(
            movie_uuid=request.movie_uuid,
            auditorium_num=request.auditorium_num,
            start_time=request.time,
            end_time=timestamp_pb2.Timestamp(seconds=int(dt.timestamp()))
        )

    def GetAudSchedulesByDate(self, request, context):
        auditoriums = db.collection('auditorium').stream()
        if auditoriums is None:
            context.set_code(grpc.StatusCode.NOT_FOUND)
            context.set_details('No auditoriums found!')
            return scheduler_pb2.Schedules()
        returns = []
        for auditorium in auditoriums:
            events = []
            aud_schedule = auditorium.to_dict()['schedules']
            if not aud_schedule or request.date not in aud_schedule:
                context.set_code(grpc.StatusCode.NOT_FOUND)
                context.set_details('No schedules found!')
                return scheduler_pb2.Schedules()
            if request.date in aud_schedule:
                for sched in aud_schedule[request.date]:
                    start_timestamp = timestamp_pb2.Timestamp().FromDatetime(sched['start_time'])
                    end_timestamp = timestamp_pb2.Timestamp().FromDatetime(sched['end_time'])
                    logging.debug("Sched: " + str(sched))
                    events.append(scheduler_pb2.Schedule(
                        movie_uuid=sched['movie_uuid'],
                        auditorium_num=auditorium.to_dict()['auditorium_num'],
                        start_time=start_timestamp,
                        end_time=end_timestamp
                    ))
            aud_sched = scheduler_pb2.AuditoriumSchedule(
                auditorium_num=str(auditorium.to_dict()['auditorium_num']),
                schedules=events
            )
            returns.append(aud_sched)
        return scheduler_pb2.AuditoriumSchedules(auditorium_schedules=returns)

    def ReserveSeat(self, request, context):
        seat = db.collection('seats').document(request.uuid).get()
        if not seat.exists:
            context.set_code(grpc.StatusCode.NOT_FOUND)
            context.set_details('Seat not found!')
            return scheduler_pb2.Seat()
        seat.reference.update({
            'status': scheduler_pb2.Status.Value("Reserved")
        })
        return scheduler_pb2.Seat(
            uuid=seat.to_dict()['uuid'],
            auditorium_uuid=seat.to_dict()['auditorium'].get().to_dict()['uuid'],
            seat_num=seat.to_dict()['seat_num'],
            status=seat.to_dict()['status'],
        )

    def GetShowtimesByDateAndMovieUuid(self, request, context):
        auditoriums = db.collection('auditorium').stream()
        if auditoriums is None:
            context.set_code(grpc.StatusCode.NOT_FOUND)
            context.set_details('No auditoriums found!')
            return scheduler_pb2.MovieShowings()
        events = []
        for auditorium in auditoriums:
            aud_schedule = auditorium.to_dict()['schedules']
            if not aud_schedule or request.date not in aud_schedule:
                context.set_code(grpc.StatusCode.NOT_FOUND)
                context.set_details('No schedules found!')
                return scheduler_pb2.MovieShowings()
            if request.date in aud_schedule:
                for sched in aud_schedule[request.date]:
                    if sched['movie_uuid'] == request.movie_uuid:
                        start_timestamp = timestamp_pb2.Timestamp()
                        start_timestamp.FromDatetime(sched['start_time'])
                        end_timestamp = timestamp_pb2.Timestamp()
                        end_timestamp.FromDatetime(sched['end_time'])
                        logging.debug("Sched: " + str(sched['movie_uuid']))
                        events.append(scheduler_pb2.MovieShowing(
                            start_time=start_timestamp,
                            auditorium_uuid=auditorium.to_dict()['uuid'],
                            date=request.date,
                        ))
        return scheduler_pb2.MovieShowings(movie_showings=events)

    def GetSeats(self, request, context):
        aud = db.collection('auditorium').where('auditorium_num', '==', request.auditorium_num).get()[0]
        logging.debug("Aud: " + str(aud))
        if not aud:
            context.set_code(grpc.StatusCode.NOT_FOUND)
            context.set_details('Auditorium not found!')
            return scheduler_pb2.Seats()
        events = aud.to_dict()['schedules'][request.date]
        if not events:
            context.set_code(grpc.StatusCode.NOT_FOUND)
            context.set_details('No schedules found!')
            return scheduler_pb2.Seats()
        event = None
        for e in events:
            logging.debug("E: " + str(e['start_time'].timestamp()))
            logging.debug("request: " + str(request))
            if int(e['start_time'].timestamp()) == request.time.seconds:
                event = e
        if not event:
            context.set_code(grpc.StatusCode.NOT_FOUND)
            context.set_details('No schedules found!')
            return scheduler_pb2.Seats()
        seats_gen_raw = event['seats']
        seats_gen = (seat.get() for seat in seats_gen_raw)
        seats = list(seats_gen)
        if not seats:
            context.set_code(grpc.StatusCode.NOT_FOUND)
            context.set_details('No seats found!')
            return scheduler_pb2.Seats()
        seat_list = []
        for seat in seats:
            seat_list.append(scheduler_pb2.Seat(
                uuid=seat.to_dict()['uuid'],
                auditorium_num=seat.to_dict()['auditorium'].get().to_dict()['auditorium_num'],
                seat_num=seat.to_dict()['seat_num'],
                status=seat.to_dict()['status'],
            ))
        return scheduler_pb2.Seats(seats=seat_list)


def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    order_pb2_grpc.add_OrderServiceServicer_to_server(GreeterServicer(), server)
    scheduler_pb2_grpc.add_MovieScheduleServiceServicer_to_server(SchedulerServicer(), server)
    server.add_insecure_port('[::]:50051')
    server.start()
    print("Server started")
    server.wait_for_termination()


if __name__ == '__main__':
    serve()
