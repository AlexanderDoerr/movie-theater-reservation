using System.ComponentModel.DataAnnotations;

public class UserDTOCreate
{
    [Required]
    public String Firstname { get; set; }

    [Required]
    public String Lastname { get; set; }

    [Required]
    public String Email { get; set; }

    [Required]
    public String Password { get; set; }
}

