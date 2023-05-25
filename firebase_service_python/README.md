# Order Management Service
This Python-based gRPC server facilitates CRUD operations for order management, specifically for creating new orders, retrieving a specific order, and retrieving all orders associated with a user.

## Dependencies
This service is dependent on the following modules:

* `time`
* `uuid`
* `concurrent.futures`
* `datetime`
* `firebase_admin`
* `grpc`
* `google.protobuf`

The auto-generated order_pb2 and order_pb2_grpc modules.
Ensure that you have all these dependencies installed on your system.

## Setup
This service uses Firebase for data persistence. As such, it is necessary to provide Firebase admin credentials to connect to Firestore.

1. Generate a new private key file for your service account from the Firebase Console.
2. Rename this file to `authToken.json` and place it in the same directory as this script.
3. Install the required packages from `requirements.txt` using `pip install -r requirements.txt`.
4. Run the following command to generate the gRPC stubs from the proto file:

```bash
python -m grpc_tools.protoc -I. --python_out=. --grpc_python_out=. .\Protos\order.proto  .\Protos\scheduler.proto 
```

This script assumes the Firestore database has a collection called 'orders'. Each document in 'orders' represents an order, which includes fields such as 'uuid', 'userid', 'ticket_uuid', 'payment_method', and 'date_created'.

## Running the Service
To run the service, simply execute the Python script via the command line:

```bash
python main.py
```
Once the service starts, it listens for incoming gRPC connections on port 50051.

## Service Definitions
This service implements three main RPC methods defined in the proto file:

### GetOrder(request)
Retrieves a single order from the Firestore database based on the provided UUID.

### CreateOrder(request)
Creates a new order in the Firestore database with the provided details and a unique order ID. The order creation time is set at the time of order creation.

### GetOrdersForUser(request)
Retrieves all orders associated with a specific user, based on the provided user UUID.

## Error Handling
The service provides appropriate gRPC statuses and error details in case of any errors or exceptions. The error messages will help understand what went wrong during the request.

## Future Improvements
This is a basic implementation of an Order Management Service. For production scenarios, consider:

* Adding authentication and authorization. 
* Performing input validation and implementing error handling comprehensively. 
* Implementing remaining CRUD operations like update and delete. 
* Providing a secure connection using SSL/TLS instead of the current insecure connection.


## References
* This `README.md` document was created using ChatGPT
* [gRPC Python Quickstart](https://grpc.io/docs/languages/python/quickstart/)
* [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup#python)