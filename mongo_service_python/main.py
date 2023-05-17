import grpc
from concurrent import futures
import order_pb2
import order_pb2_grpc
from google.protobuf import timestamp_pb2
from datetime import datetime
import time


def get_current_timestamp():
    now = datetime.now()
    timestamp = timestamp_pb2.Timestamp()
    timestamp.FromDatetime(now)
    return timestamp


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


def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    order_pb2_grpc.add_OrderServiceServicer_to_server(GreeterServicer(), server)
    server.add_insecure_port('[::]:50051')
    server.start()
    print("Server started")
    server.wait_for_termination()


if __name__ == '__main__':
    serve()
