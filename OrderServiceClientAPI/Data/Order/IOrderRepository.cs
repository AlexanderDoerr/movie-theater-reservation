public interface IOrderRepository
{
    public Task<Guid> Create(OrderDTOCreate orderDTOCreate, Guid userGuid);
    public void Delete(Guid orderGuid);
    public IEnumerable<Order> GetOrdersByUserId(Guid userGuid);
}