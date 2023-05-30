using System.ComponentModel.DataAnnotations;

public class User
{
    [Key]
    public string UserGuid { get; set; }

    [Required]
    public string Firstname { get; set; }

    [Required]
    public string Lastname { get; set; }

    [Required]
    public string Email { get; set; }

    public string Password { get; set; }

    [Required]
    public DateTime CreatedDate { get; set; }

    string toString()
    {
        return this.UserGuid.ToString();
    }
}