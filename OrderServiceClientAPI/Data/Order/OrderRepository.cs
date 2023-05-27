using System;
using System.Buffers.Text;
using System.Collections.Generic;
using System.Numerics;
using System.Threading.Tasks;
using Google.Protobuf.WellKnownTypes;
using Grpc.Core;
using OrderServiceClient;
using OrderServiceClientAPI.Data.Ticket;

public class OrderRepository : IOrderRepository
{
    private readonly Channel _channel;
    private readonly OrderService.OrderServiceClient _client;

    public OrderRepository()
    {
        _channel = new Channel("firebase-service-python:50051", ChannelCredentials.Insecure);
        _client = new OrderService.OrderServiceClient(_channel);
    }

    public async Task<Guid> Create(OrderDTOCreate orderDTOCreate, Guid userGuid)
    {
        var orderCreate = new OrderCreate
        {
            UserUuid = userGuid.ToString(),
            SeatNum = { orderDTOCreate.Seats },
            TheaterRoom = orderDTOCreate.TheaterRoom,
            MovieTime = Timestamp.FromDateTime(orderDTOCreate.MovieTime),
            MovieDate = orderDTOCreate.MovieDate,
            IsPaid = new IsPaid { IsPaid_ = orderDTOCreate.IsPaid }
        };

        var response = await _client.CreateOrderAsync(orderCreate);

        if (Guid.TryParse(response.Uuid, out Guid orderGuid))
        {
            return orderGuid;
        } else
        {
            throw new Exception("Invalid GUID format in the response.");
        }
    }

    public void Delete(Guid orderGuid)
    {
        var orderId = new Orderid { Uuid = orderGuid.ToString() };
        _client.DeleteOrder(orderId);
    }

    public IEnumerable<OrderDTO> GetOrdersByUserId(Guid userGuid)
    {
        var userId = new Userid { Uuid = userGuid.ToString() };
        var orders = _client.GetOrdersByUserId(userId);

        var orderList = new List<OrderDTO>();

        foreach (var order in orders.OrderList)
        {
            var orderDto = new OrderDTO
            {
                OrderGuid = order.Uuid,
                UserGuid = order.UserUuid,
                Tickets = order.Tickets.Select(ticket => new Ticket
                {
                    MovieGuid = ticket.MovieUuid,
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

    public OrderDTO GetOrderById(Guid orderGuid)
    {
        var orderId = new Orderid { Uuid = orderGuid.ToString() };
        var response = _client.GetOrder(orderId);

        var tickets = new List<Ticket>();
        foreach (var ticket in response.Tickets)
        {
            var ticketStub = new Ticket
            {
                MovieGuid = ticket.MovieUuid,
                TheaterRoom = ticket.TheaterRoom,
                MovieTime = ticket.MovieTime,
                SeatNum = ticket.SeatNum
            };
            tickets.Add(ticketStub);
        }

        var order = new OrderDTO
        {
            OrderGuid = response.Uuid,
            UserGuid = response.UserUuid,
            Tickets = tickets,
            IsPaid = response.IsPaid.IsPaid_,
            CreatedDate = response.DateCreated.ToDateTime()
        };

        return order;
    }
}