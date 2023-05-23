using OrderServiceClientAPI.Data.Payment;
using OrderServiceClientAPI.Data.Ticket;
using System.ComponentModel.DataAnnotations;
using OrderServiceClientAPI;

public class OrderDTOCreate
{
    [Required]
    public Guid UserGuid { get; set; }

    [Required]
    public List<string> Seats { get; set; }

    [Required]
    public int TheaterRoom { get; set; }

    [Required]
    public string MovieTime { get; set; }

    [Required]
    public bool IsPaid { get; set; }
}