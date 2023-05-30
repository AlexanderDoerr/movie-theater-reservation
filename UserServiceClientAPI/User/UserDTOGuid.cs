namespace UserServiceClientAPI.User
{
    using System.ComponentModel.DataAnnotations;

    public class UserDTOGuid
    {
        [Required]
        public Guid UserGuid { get; set; }
    }
}
