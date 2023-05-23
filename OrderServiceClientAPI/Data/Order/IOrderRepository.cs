public interface IOrderRepository
{
    public Task<Guid> Create(OrderDTOCreate orderDTOCreate, Guid userGuid);
    public void Delete(Guid orderGuid);
    public IEnumerable<OrderDTO> GetOrdersByUserId(Guid userGuid);
    public OrderDTO GetOrderById(Guid orderGuid);
}