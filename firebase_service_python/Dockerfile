# Use a base Python image
FROM python:3.10.11

# Set the working directory inside the container
WORKDIR /app

# Copy requirements.txt to the working directory
COPY requirements.txt .

# Install the project dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code to the working directory
COPY . .

RUN python -m grpc_tools.protoc -I. --python_out=. --grpc_python_out=. ./Protos/order.proto  ./Protos/scheduler.proto

# Start the Python application
CMD ["python", "main.py"]