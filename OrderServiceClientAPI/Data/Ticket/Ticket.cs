using System.ComponentModel.DataAnnotations;

namespace OrderServiceClientAPI.Data.Ticket
{
    public class Ticket
    {
        [Required]
        public string MovieGuid { get; set; }

        [Required]
        public int TheaterRoom { get; set; }

        [Required]
        public string MovieTime { get; set; }

        [Required]
        public string SeatNum {  get; set; }
    }
}
