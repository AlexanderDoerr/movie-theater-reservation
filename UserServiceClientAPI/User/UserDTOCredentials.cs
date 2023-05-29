namespace UserServiceClientAPI.User
{
    using System.ComponentModel.DataAnnotations;

    public class UserDTOCredentials
    {
        [Required]
        public String Email { get; set; }

        [Required]
        public String Password { get; set; }
    }

}
