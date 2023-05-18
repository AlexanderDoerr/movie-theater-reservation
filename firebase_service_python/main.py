import time
import uuid
from concurrent import futures
from datetime import datetime

import firebase_admin
import grpc
from firebase_admin import firestore, credentials
from google.protobuf import timestamp_pb2

import order_pb2
import order_pb2_grpc

cred = credentials.Certificate("authToken.json")
app = firebase_admin.initialize_app(cred)
db = firestore.client()


def get_current_timestamp():
    now = datetime.now()
    return int(time.mktime(now.timetuple()))


class GreeterServicer(order_pb2_grpc.OrderServiceServicer):
    def GetOrder(self, request, context):
        doc_ref = db.collection('orders').document(request.uuid)
        doc = doc_ref.get()
        if doc.exists:
            print(doc.to_dict())
            return order_pb2.OrderIn(
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
            doc_ref.set({
                'uuid': orderid,
                'userid': request.userid,
                'ticket_uuid': [x for x in request.ticket_uuid],
                'payment_method': {
                    'ccNum': request.payment_method.ccNum,
                    'expDate': request.payment_method.expDate,
                    'cvv': request.payment_method.cvv,
                    'name': request.payment_method.name
                },
                'date_created': seconds
            })
            print(request)
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
