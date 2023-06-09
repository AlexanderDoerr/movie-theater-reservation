﻿using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Logging;

[ApiController]
[Route("[controller]")]
public class OrderController : ControllerBase
{
    private readonly ILogger<OrderController> _logger;
    private readonly IOrderRepository _ordersRepository;

    public OrderController(ILogger<OrderController> logger, IOrderRepository ordersRepository)
    {
        _logger = logger;
        _ordersRepository = ordersRepository;
    }

    [HttpPost]
    //[Authorize]
    public IActionResult Create(OrderDTOCreate orderDTOCreate)
    {
        string userGuid = "E8E369C0-960B-4584-9A81-F9FF9F98DBD6";

        try
        {
            //var userGuid = HttpContext.User.Claims.Where(x => x.Type == "UserGuid").FirstOrDefault()?.Value;
            //var userGuid = HttpContext.User.Claims.Where(x => x.Type == "Name").FirstOrDefault()?.Value;

            //Console.WriteLine(userGuid);

            if (string.IsNullOrEmpty(userGuid)) throw new Exception("it was null...");

            var order = _ordersRepository.Create(orderDTOCreate, userGuid);

            return Ok(new
            {
                Success = true,
                Message = "Order created.",
                Order = order
            });

        } catch (Exception ex)
        {
            Console.WriteLine(ex.Message);
            return StatusCode(500, ex.Message);
        }
    }

    [HttpDelete]
    //[Authorize]
    [Route("{orderid}")]
    public void Delete(string orderid)
    {
        try
        {
            _ordersRepository.Delete(orderid);
        } catch (Exception ex)
        {
            Console.WriteLine(ex.Message);
        }
    }

    [HttpGet]
    //[Authorize]
    [Route("userid/{userid}")]
    public async Task<IActionResult> GetOrdersUserid(string userid)
    {
        try
        {
            var Data = await Task.Run(() => _ordersRepository.GetOrdersByUserId(userid));
            // _ordersRepository.GetOrdersByUserId(userGuid);
            return Ok(new
            {
                Success = true,
                Message = "All Orders returned.",
                Data
            });
        } catch (Exception ex)
        {
            Console.WriteLine(ex.Message);
            return StatusCode(500, ex.Message);
        }
    }

    [HttpGet("orderid/{orderId}")]
    //[Authorize]
    public ActionResult<OrderDTO> GetOrderByOrderId(string orderId)
    {
        var order = _ordersRepository.GetOrderById(orderId);

        if (order == null)
        {
            return NotFound("Order not found.");
        }

        return Ok(order);
    }
}