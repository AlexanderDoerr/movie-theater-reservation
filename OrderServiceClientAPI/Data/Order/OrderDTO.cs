using System.ComponentModel.DataAnnotations;
using OrderServiceClientAPI.Data.Ticket;
//using OrderServiceClientAPI.Data.Payment;

public class OrderDTO
{
    [Key]
    public Guid OrderGuid { get; set; }

    [Required]
    public Guid UserGuid { get; set; }

    [Required]
    public List<Ticket>? Tickets { get; set; }

    [Required]
    public bool IsPaid { get; set; }

    [Required]
    public DateTime CreatedDate { get; set; }

}