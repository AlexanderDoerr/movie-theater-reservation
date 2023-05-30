﻿public interface IOrderRepository
{
    public Task<string> Create(OrderDTOCreate orderDTOCreate, string userGuid);
    public void Delete(string orderGuid);
    public IEnumerable<OrderDTO> GetOrdersByUserId(string userGuid);
    public OrderDTO GetOrderById(string orderGuid);
}