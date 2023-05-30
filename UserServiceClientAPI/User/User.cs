﻿using System.ComponentModel.DataAnnotations;

public class User
{
    [Key]
    public String UserGuid { get; set; }

    [Required]
    public String Firstname { get; set; }

    [Required]
    public String Lastname { get; set; }

    [Required]
    public String Email { get; set; }

    public String Password { get; set; }

    [Required]
    public DateTime CreatedDate { get; set; }

    //string toString()
    //{
    //    return this.UserGuid.ToString();
    //}
}