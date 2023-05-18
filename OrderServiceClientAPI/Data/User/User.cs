using System.ComponentModel.DataAnnotations;

namespace OrderServiceClientAPI.Data.User
{
    public class User
    {
        [Required]
        public Guid? UserGuid { get; set; }

        [Required]
        public string Name { get; set; }

        [Required]
        public string Email { get; set; }
    }
}
