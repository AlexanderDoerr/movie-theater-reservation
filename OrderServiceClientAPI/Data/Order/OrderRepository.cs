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

    public async Task<OrderDTO> Create(OrderDTOCreate orderDTOCreate, string userUuid)
    {
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

        OrderServiceClient.Order response = await _client.CreateOrderAsync(orderCreate);

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

        // Convert OrderServiceClient.Order to Order
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

    public void Delete(string orderUuid)
    {
        var orderId = new Orderid { Uuid = orderUuid.ToString() };
        _client.DeleteOrder(orderId);
    }

    public IEnumerable<OrderDTO> GetOrdersByUserId(string userUuid)
    {
        var userId = new Userid { Uuid = userUuid.ToString() };
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