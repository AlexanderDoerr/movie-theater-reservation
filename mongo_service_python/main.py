import firebase_admin
import grpc
import uuid
from concurrent import futures
import order_pb2
import order_pb2_grpc
from google.protobuf import timestamp_pb2
from datetime import datetime
import time
from firebase_functions import firestore_fn, https_fn
from firebase_admin import initialize_app, firestore, credentials
import google.cloud.firestore

cred = credentials.Certificate("testproject-3ef55-firebase-adminsdk-faisi-95d260ef38.json")
app = firebase_admin.initialize_app(cred)
db = firestore.client()



def get_current_timestamp():
    now = datetime.now()
    return int(time.mktime(now.timetuple()))


class GreeterServicer(order_pb2_grpc.OrderServiceServicer):
    def GetOrder(self, request, context):
        uuid = "1234"
        userid = "usrid1234"
        ticket_uuids = ["tcktid1234"]
        payment_method = order_pb2.PaymentMethod(
            ccNum="1234",
            expDate="1234",
            cvv="1234",
            name="1234"
        )
        now = datetime.now()
        seconds = int(time.mktime(now.timetuple()))
        date_created = timestamp_pb2.Timestamp(seconds=seconds)
        return order_pb2.OrderIn(
            uuid=uuid,
            userid=userid,
            ticket_uuid=ticket_uuids,
            payment_method=payment_method,
            date_created=date_created
        )


    def CreateOrder(self, request, context):
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


def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    order_pb2_grpc.add_OrderServiceServicer_to_server(GreeterServicer(), server)
    server.add_insecure_port('[::]:50051')
    server.start()
    print("Server started")
    server.wait_for_termination()


if __name__ == '__main__':
    serve()
