import time
import uuid
from concurrent import futures
from datetime import datetime

import firebase_admin
import grpc
from firebase_admin import firestore, credentials
from google.protobuf import timestamp_pb2

from Protos import order_pb2, order_pb2_grpc

cred = credentials.Certificate("authToken.json")
app = firebase_admin.initialize_app(cred)
db = firestore.client()


def get_current_timestamp():
    now = datetime.now()
    return int(time.mktime(now.timetuple()))


class GreeterServicer(order_pb2_grpc.OrderServiceServicer):
    def GetOrder(self, request, context):
        print("getting order: " + request.uuid)
        doc_ref = db.collection('orders').document(request.uuid.replace('-', ''))
        doc = doc_ref.get()
        tickets_raw = doc.to_dict()['tickets']
        ticket_stubs = []
        print(tickets_raw)
        for ticket in tickets_raw:
            tdoc = ticket.get()
            aud_doc = tdoc.to_dict()['auditorium'].get()
            schedule = aud_doc.to_dict()['schedules'][tdoc.to_dict()['movie_date']][tdoc.to_dict()['movie_index']]
            seat_doc = tdoc.to_dict()["seat"].get()
            seat_num = seat_doc.to_dict()['seat_num']
            print("Ticket Stub: " + str(schedule['movie_uuid']) + " " + str(aud_doc.to_dict()['auditorium_num']) + " " + str(schedule['start_time']) + " " + str(seat_num))

            ticket_stubs.append(order_pb2.TicketStub(
                movie_uuid=schedule['movie_uuid'],
                theater_room=aud_doc.to_dict()['auditorium_num'],
                movie_time=str(schedule['start_time']),
                seat_num=seat_num,
            ))
        print(ticket_stubs)
        if doc.exists:
            # put the dashes back in the guids
            formatted_user_guid = doc.to_dict()['user_uuid'][:8] + '-' + doc.to_dict()['user_uuid'][8:12] + '-' + doc.to_dict()['user_uuid'][12:16] + '-' + doc.to_dict()['user_uuid'][16:20] + '-' + doc.to_dict()['user_uuid'][20:]
            formatted_guid = doc.to_dict()['uuid'][:8] + '-' + doc.to_dict()['uuid'][8:12] + '-' + doc.to_dict()['uuid'][12:16] + '-' + doc.to_dict()['uuid'][16:20] + '-' + doc.to_dict()['uuid'][20:]
            print(formatted_guid)
            return order_pb2.Order(
                uuid=formatted_guid,
                user_uuid=formatted_user_guid,
                tickets=ticket_stubs,
                is_paid=order_pb2.IsPaid(is_paid=doc.to_dict()['isPaid']),
                date_created=timestamp_pb2.Timestamp(seconds=doc.to_dict()['date_created'])
            )
        else:
            context.set_code(grpc.StatusCode.NOT_FOUND)
            context.set_details('Order not found!')
            return order_pb2.OrderIn()

    def CreateOrder(self, request, context):
        try:
            seconds = get_current_timestamp()
            date_created = timestamp_pb2.Timestamp(seconds=seconds)
            orderid = uuid.uuid4().hex
            doc_ref = db.collection('orders').document(orderid)
            # doc_ref.set({
            #     user_uuid=request.user_uuid,
            #
            # })
            print(request)
            context.set_code(grpc.StatusCode.OK)
            return order_pb2.OrderIn(
                uuid=orderid,
                userid=request.userid,
                ticket_uuid=request.ticket_uuid,
                payment_method=request.payment_method,
                date_created=date_created
            )
        except Exception as e:
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details('Error! ' + str(e))
            return order_pb2.OrderIn()

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
