using OrderServiceClientAPI.Data.Payment;
using OrderServiceClientAPI.Data.Ticket;
using System.ComponentModel.DataAnnotations;

public class OrderDTOCreate
{
    [Required]
    public Guid UserGuid { get; set; }

    [Required]
    public List<Ticket> Tickets { get; set; }

    [Required]
    public Payment? Payment { get; set; }
}
