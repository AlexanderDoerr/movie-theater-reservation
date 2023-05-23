using System;
using System.Buffers.Text;
using System.Collections.Generic;
using System.Numerics;
using System.Threading.Tasks;
using Grpc.Core;
using OrderServiceClient;
using OrderServiceClientAPI.Data.Payment;
using OrderServiceClientAPI.Data.Ticket;
//using Steeltoe.Common.Order;

public class OrderRepository : IOrderRepository
{
    private readonly Channel _channel;
    private readonly OrderService.OrderServiceClient _client;

    public OrderRepository()
    {
        _channel = new Channel("localhost:50051", ChannelCredentials.Insecure);
        _client = new OrderService.OrderServiceClient(_channel);
    }

    public async Task<Guid> Create(OrderDTOCreate orderDTOCreate, Guid userGuid)
    {
        var orderCreate = new OrderCreate
        {
            Userid = userGuid.ToString(),
            SeatNum = { orderDTOCreate.Seats },
            TheaterRoom = orderDTOCreate.TheaterRoom,
            MovieTime = orderDTOCreate.MovieTime,
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
                OrderGuid = Guid.Parse(order.Uuid),
                UserGuid = Guid.Parse(order.Userid),
                Tickets = order.Tickets.Select(ticket => new Ticket
                {
                    MovieGuid = ticket.Movieuuid,
                    TheaterRoom = ticket.TheaterRoom,
                    MovieTime = ticket.MovieTime,
                    SeatNum = ticket.SeatNumber
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

        var ticketStubs = new List<TicketStub>();
        foreach (var ticket in response.Tickets)
        {
            var ticketStub = new TicketStub
            {
                Movieuuid = ticket.Movieuuid,
                TheaterRoom = ticket.TheaterRoom,
                MovieTime = ticket.MovieTime,
                SeatNum = ticket.SeatNum
            };
            ticketStubs.Add(ticketStub);
        }

        var order = new OrderDTO
        {
            OrderGuid = Guid.Parse(response.uuid),
            UserGuid = Guid.Parse(response.userid),
            Tickets = ticketStubs,
            IsPaid = response.is_paid.IsPaid,
            CreatedDate = response.date_created.ToDateTime()
        };

        return order;
    }
}