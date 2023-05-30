namespace UserServiceClientAPI.User
{
    using System.ComponentModel.DataAnnotations;

    public class UserDTOCredentials
    {
        [Required]
        public string Email { get; set; }

        [Required]
        public string Password { get; set; }
    }

}
