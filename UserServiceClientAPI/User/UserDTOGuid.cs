namespace UserServiceClientAPI.User
{
    using System.ComponentModel.DataAnnotations;

    public class UserDTOGuid
    {
        [Required]
        public String UserGuid { get; set; }
    }
}
