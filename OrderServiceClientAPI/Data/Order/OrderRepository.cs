using System.Data;
using Grpc.Core;
using OrderServiceClient;
using OrderServiceClientAPI.Data.Payment;
using OrderServiceClientAPI.Data.Ticket;

public class OrderRepository : IOrderRepository
{

    public Task<Guid> Create(OrderDTOCreate orderDTOCreate, Guid userGuid)
    {
        Channel channel = new Channel("localhost:50051", ChannelCredentials.Insecure);
        var client = new OrderService.OrderServiceClient(channel);
        var timestamp = Google.Protobuf.WellKnownTypes.Timestamp.FromDateTime(DateTime.UtcNow);
        var paymentMethod = (OrderServiceClient.PaymentMethod)Enum.Parse(typeof(OrderServiceClient.PaymentMethod), orderDTOCreate.Payment.ToString());
        var reply = client.CreateOrder(new OrderOut
        {
            Userid = userGuid.ToString(),
            TicketUuid = { orderDTOCreate.Tickets.Select(ticket => ticket.ToString()).ToArray() },
            PaymentMethod = paymentMethod,
            DateCreated = timestamp
        });

        if (Guid.TryParse(reply.Uuid, out Guid guid))
        {
            return Task.FromResult(guid);
        } else
        {
            // Handle the case where the reply.Uuid is not a valid GUID
            throw new Exception("Invalid GUID format in the reply.");
        }
    }

    public void Delete(Guid orderGuid)
    {
        Channel channel = new Channel("localhost:50051", ChannelCredentials.Insecure);
        var client = new OrderService.OrderServiceClient(channel);

        var orderid = new Orderid { Uuid = orderGuid.ToString() };
        _ = client.DeleteOrderAsync(orderid);

        // The method will return immediately without waiting for the delete operation to complete.
    }

    public IEnumerable<Order> GetOrdersByUserId(Guid userGuid)
    {
        Channel channel = new Channel("localhost:50051", ChannelCredentials.Insecure);
        var client = new OrderService.OrderServiceClient(channel);

        var userid = new Userid { Uuid = userGuid.ToString() };
        var orders = client.GetOrdersByUserId(userid);

        List<Order> orderList = new List<Order>();
        while (orders.ResponseStream.MoveNext().Result)
        {
            var order = orders.ResponseStream.Current;

            var orderDto = new Order
            {
                // Mapping properties from the response to the Order DTO
                OrderGuid = Guid.Parse(order.Uuid),
                UserGuid = Guid.Parse(order.Userid),
                Payment = new Payment
                {
                    CcNum = order.PaymentMethod.CcNum,
                    ExpDate = order.PaymentMethod.ExpDate,
                    Cvv = order.PaymentMethod.Cvv,
                    Name = order.PaymentMethod.Name
                },
                CreatedDate = order.DateCreated.ToDateTime()
            };

            // Mapping ticket UUIDs to Ticket objects
            foreach (var ticketUuid in order.TicketUuid)
            {
                orderDto.Tickets.Add(new Ticket
                {
                    Movieuuid = ticketUuid.Movieuuid,
                    TheaterRoom = ticketUuid.TheaterRoom,
                    MovieTime = ticketUuid.MovieTime,
                    SeatNumber = ticketUuid.SeatNumber
                });
            }

            orderList.Add(orderDto);
        }

        return orderList;
    }

}