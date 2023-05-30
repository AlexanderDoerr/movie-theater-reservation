using OrderServiceClientAPI.Data.Payment;
using OrderServiceClientAPI.Data.Ticket;
using System.ComponentModel.DataAnnotations;
using OrderServiceClientAPI;

public class OrderDTOCreate
{
    [Required]
    public string UserUuid { get; set; }

    [Required]
    public List<string> Seats { get; set; }

    [Required]
    public int TheaterRoom { get; set; }

    [Required]
    public DateTime MovieTime { get; set; }

    [Required]
    public string MovieDate { get; set; }

    [Required]
    public bool IsPaid { get; set; }

    [Required]
    public string UserEmail { get; set; }

    [Required]
    public string UserName { get; set; }

    [Required]
    public string MovieTitle { get; set; }
}