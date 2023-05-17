import grpc
from concurrent import futures
import order_pb2
import order_pb2_grpc


class GreeterServicer(order_pb2_grpc.OrderServiceServicer):
    def GetOrder(self, request, context):
        uuid = "1234"
        userid = "usrid1234"
        ticket_uuid = "tcktid1234"
        payment_method = {"ccNum": "1234", "expDate": "1234", "cvv": "1234", "name": "1234"}
        return order_pb2.OrderIn(uuid=uuid, userid=userid, ticket_uuid=ticket_uuid,
                                 payment_method=payment_method, date_created=request.date_created)


def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    order_pb2_grpc.add_OrderServiceServicer_to_server(GreeterServicer(), server)
    server.add_insecure_port('[::]:50051')
    server.start()
    print("Server started")
    server.wait_for_termination()



if __name__ == '__main__':
    serve()
