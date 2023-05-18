using System.ComponentModel.DataAnnotations;

namespace OrderServiceClientAPI.Data.Payment
{
    public class Payment
    {
        [Required]
        public string CcNum { get; set; }

        [Required]
        public string ExpDate { get; set; }

        [Required]
        public string Cvv { get; set; }

        [Required]
        public string Name { get; set; }
    }
}
