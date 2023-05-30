using System;
using System.Buffers.Text;
using System.Collections.Generic;
using System.Numerics;
using System.Threading.Tasks;
using Google.Protobuf.WellKnownTypes;
using Grpc.Core;
using OrderServiceClient;
using OrderServiceClientAPI.Data.Ticket;
using System.Globalization;
using Kafka = Confluent.Kafka;
using System.Net.Mail;
using System.Net;
using static Google.Apis.Requests.BatchRequest;
using System.Xml.Linq;
using Newtonsoft.Json;

public class OrderRepository : IOrderRepository
{
    private readonly Channel _channel;
    private readonly OrderService.OrderServiceClient _client;

    public OrderRepository()
    {
        _channel = new Channel("firebase-service-python:50051", ChannelCredentials.Insecure);
        _client = new OrderService.OrderServiceClient(_channel);
    }

    public async Task<string> Create(OrderDTOCreate orderDTOCreate, string userUuid)
    {
        //message OrderCreate {
        //string user_uuid = 1;
        //repeated string seat_num = 2;
        //int32 theater_room = 3;
        //google.protobuf.Timestamp movie_time = 4;
        //string movie_date = 5;
        //IsPaid is_paid = 6;
    
        var movieTimeUtc = orderDTOCreate.MovieTime.ToUniversalTime();
        var movieDate = DateTime.ParseExact(orderDTOCreate.MovieDate, "yyyy-MM-dd", CultureInfo.InvariantCulture);

        var orderCreate = new OrderCreate
        {
            UserUuid = userUuid,
            SeatNum = { orderDTOCreate.Seats },
            TheaterRoom = orderDTOCreate.TheaterRoom,
            MovieTime = Timestamp.FromDateTime(movieTimeUtc),
            MovieDate = movieDate.ToString("MM/dd/yyyy", CultureInfo.InvariantCulture),
            IsPaid = new IsPaid { IsPaid_ = orderDTOCreate.IsPaid }
        };

        // orderCreate.SeatNum.AddRange(orderDTOCreate.Seats);

        var response = await _client.CreateOrderAsync(orderCreate);

        Console.WriteLine("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!" + response.ToString());

        //if (Guid.TryParse(response.Uuid, out Guid orderGuid))
        //{
        //    var config = new Kafka.ProducerConfig
        //    {
        //        BootstrapServers = "broker:9092"
        //    };

        //    using (var producer = new Kafka.ProducerBuilder<string, string>(config).Build())
        //    {
        //        var key = "order-created";
        //        //var value = userGuid;

        //        var message = new Kafka.Message<string, string>
        //        {
        //            Key = key,
        //            //Value = value
        //        };

        //        producer.ProduceAsync("orders", message).Wait();
        //    }

        //    // Send email here after the Kafka message sending
        //    await SendEmail(orderDTOCreate);

        //    return orderGuid.ToString();
        //} else
        //{
        //    throw new Exception("Invalid GUID format in the response.");
        //}
        return response.UserUuid.ToString();
    }

    private async Task SendEmail(OrderDTOCreate orderDetails)
    {
        // Code to send the email using SmtpClient
        // Replace the placeholders with your actual email sending logic


        var config = new Kafka.ProducerConfig
        {
            BootstrapServers = "broker:9092"
        };

        using (var producer = new Kafka.ProducerBuilder<string, string>(config).Build())
        {
            var key = "order-created";
            var value = JsonConvert.SerializeObject(orderDetails);

            var message = new Kafka.Message<string, string>
            {
                Key = key,
                Value = value
            };

            producer.ProduceAsync("users", message).Wait();
        }


        //using (var client = new SmtpClient("smtp.example.com", 587))
        //{
        //    client.UseDefaultCredentials = false;
        //    client.Credentials = new NetworkCredential("username", "password");
        //    client.EnableSsl = true;

        //    var message = new MailMessage
        //    {
        //        From = new MailAddress("from@example.com"),
        //        To = { new MailAddress(orderDetails.UserEmail) },
        //        Subject = "Order Created at SilverScreenCinema",
        //        Body = $"Order created for user: {orderDetails.UserName}\n\n" +
        //           $"Order Details:\n" +
        //           $"Movie: {orderDetails.MovieTitle}\n" +
        //           $"Date: {orderDetails.MovieDate}\n" +
        //           $"Time: {orderDetails.MovieTime}\n" +
        //           $"Seats: {string.Join(", ", orderDetails.Seats)}\n" +
        //           $"Paid: {orderDetails.IsPaid}\n"
        //    };

        //    client.Send(message);
        //}
    }

    public void Delete(string orderGuid)
    {
        var orderId = new Orderid { Uuid = orderGuid.ToString() };
        _client.DeleteOrder(orderId);
    }

    public IEnumerable<OrderDTO> GetOrdersByUserId(string userGuid)
    {
        var userId = new Userid { Uuid = userGuid.ToString() };
        var orders = _client.GetOrdersByUserId(userId);

        var orderList = new List<OrderDTO>();

        foreach (var order in orders.OrderList)
        {
            var orderDto = new OrderDTO
            {
                OrderUuid = order.Uuid,
                UserUuid = order.UserUuid,
                Tickets = order.Tickets.Select(ticket => new Ticket
                {
                    MovieUuid = ticket.MovieUuid,
                    TheaterRoom = ticket.TheaterRoom,
                    MovieTime = ticket.MovieTime,
                    SeatNum = ticket.SeatNum
                }).ToList(),
                IsPaid = order.IsPaid.IsPaid_,
                CreatedDate = order.DateCreated.ToDateTime()
            };

            orderList.Add(orderDto);
        }
        return orderList;
    }

    public OrderDTO GetOrderById(string orderGuid)
    {
        var orderId = new Orderid { Uuid = orderGuid.ToString() };
        var response = _client.GetOrder(orderId);

        Console.WriteLine(response.ToString());
        //{
            //"uuid": "40c7aa4b-e021-47ff-9ba5-b16471f1fd1a",
            //"userUuid": "1234----",
            //"tickets": [ { "movieUuid": "ph", "theaterRoom": 1, "movieTime": "2023-05-19 19:00:00.776000+00:00", "seatNum": "a1" } ],
            //"isPaid": { }
        //}

        var tickets = new List<Ticket>();
        foreach (var ticket in response.Tickets)
        {
            var ticketStub = new Ticket
            {
                MovieUuid = ticket.MovieUuid,
                TheaterRoom = ticket.TheaterRoom,
                MovieTime = ticket.MovieTime,
                SeatNum = ticket.SeatNum
            };
            tickets.Add(ticketStub);
        }

        var order = new OrderDTO
        {
            OrderUuid = response.Uuid,
            UserUuid = response.UserUuid,
            Tickets = tickets,
            IsPaid = response.IsPaid.IsPaid_,
            CreatedDate = response.DateCreated.ToDateTime()
        };

        return order;
    }
}