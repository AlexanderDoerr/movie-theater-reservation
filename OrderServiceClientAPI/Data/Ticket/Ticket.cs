using System.ComponentModel.DataAnnotations;

namespace OrderServiceClientAPI.Data.Ticket
{
    public class Ticket
    {
        [Required]
        public Guid MovieGuid { get; set; }

        [Required]
        public string TheaterRoom { get; set; }

        [Required]
        public string Time { get; set; }

        [Required]
        public string Seat {  get; set; }
    }
}
