import logging
import sys
import time
import uuid
from concurrent import futures
from datetime import datetime

import firebase_admin
import grpc
from firebase_admin import firestore, credentials
from google.cloud.firestore_v1 import DocumentSnapshot
from google.protobuf import timestamp_pb2
from proto.datetime_helpers import DatetimeWithNanoseconds

from Protos import order_pb2, order_pb2_grpc

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


def get_seat_and_movie_index_and_aud_by_seat_num_auditorium_movie_date_and_movie_timestamp(seat_num, auditorium_num, movie_date, movie_timestamp):
    try:
        auditorium = db.collection('auditorium').where('auditorium_num', '==', auditorium_num).get()[0]
        logging.debug("timestamp: " + str(movie_timestamp))
        seconds = movie_timestamp.seconds
        formatted_movie_time = datetime.fromtimestamp(seconds)
        schedule = auditorium.to_dict()['schedules'][movie_date]
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
            dt = datetime.strptime(str(doc.to_dict()['date_created']), "%Y-%m-%d %H:%M:%S")
            timestamp = timestamp_pb2.Timestamp()
            timestamp.FromDatetime(dt)
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
                seat, movie_index, aud = get_seat_and_movie_index_and_aud_by_seat_num_auditorium_movie_date_and_movie_timestamp(seat_num, request.theater_room, request.movie_date, request.movie_time)
                if seat is None:
                    context.set_code(grpc.StatusCode.NOT_FOUND)
                    context.set_details('Seat not found!')
                    return order_pb2.Order()
                # ds = DocumentSnapshot.reference
                logging.debug("Seat: " + str(seat.reference))
                ticket_doc_ref = db.collection('tickets').document(ticket_uuid)
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

    def GetOrdersForUser(self, request, context):
        docs = db.collection('orders').where('userid', '==', request.uuid).stream()
        if docs is None:
            context.set_code(grpc.StatusCode.NOT_FOUND)
            context.set_details('No orders found for user!')
            return order_pb2.OrderIn()
        for doc in docs:
            print(doc.to_dict())
            yield order_pb2.OrderIn(
                uuid=doc.to_dict()['uuid'],
                userid=doc.to_dict()['userid'],
                ticket_uuid=doc.to_dict()['ticket_uuid'],
                payment_method=order_pb2.PaymentMethod(
                    ccNum=doc.to_dict()['payment_method']['ccNum'],
                    expDate=doc.to_dict()['payment_method']['expDate'],
                    cvv=doc.to_dict()['payment_method']['cvv'],
                    name=doc.to_dict()['payment_method']['name']
                ),
                date_created=timestamp_pb2.Timestamp(seconds=doc.to_dict()['date_created'])
            )


def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    order_pb2_grpc.add_OrderServiceServicer_to_server(GreeterServicer(), server)
    server.add_insecure_port('[::]:50051')
    server.start()
    print("Server started")
    server.wait_for_termination()


if __name__ == '__main__':
    serve()
