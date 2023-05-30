using System.ComponentModel.DataAnnotations;

public class UserDTOCreate
{
    [Required]
    public string Firstname { get; set; }

    [Required]  
    public string Lastname { get; set; }

    [Required]
    public string Email { get; set; }

    [Required]
    public string Password { get; set; }
}

