using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

//eureka
using Steeltoe.Discovery.Client;
using Steeltoe.Discovery.Eureka;

internal class Program
{
    private static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        builder.Services.AddScoped<IUserRepository, UserRepository>();

        //builder.Services.AddAuthentication(options =>
        //{
        //    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        //    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        //    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
        //})
        //.AddJwtBearer(o =>
        //{
        //    o.SaveToken = true;
        //    o.RequireHttpsMetadata = false;

        //    o.TokenValidationParameters = new TokenValidationParameters
        //    {
        //        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        //        ValidAudience = builder.Configuration["Jwt:Audience"],
        //        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"])),
        //        ValidateIssuer = true,
        //        ValidateAudience = true,
        //        ValidateLifetime = false,
        //        ValidateIssuerSigningKey = true
        //    };
        //});

        builder.Services.AddAuthorization();
        // Add services to the container.

        builder.Services.AddControllers();
        // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();

        //eureka
        //builder.Services.AddDiscoveryClient(builder.Configuration);

        var app = builder.Build();

        // Configure the HTTP request pipeline.
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.UseHttpsRedirection();

        app.UseAuthentication();
        app.UseAuthorization();

        app.MapControllers();

        //app.MapPost("/security/createToken2", [AllowAnonymous] async (User user, IConfiguration _config, IUserRepository _userRepository) =>
        //{
        //    //if (user.Email == "ccantera@yahoo.com" && user.Password == "pwd123")
        //    User uu = await _userRepository.GetByCredentials(user.Username, user.Password);

        //    if (uu != null)
        //    {
        //        var authClaims = new List<Claim> { new(ClaimTypes.Name, user.UserGuid.ToString()), new(ClaimTypes.Email, user.Email), };
        //        var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));

        //        var token = new JwtSecurityToken(
        //            issuer: _config["Jwt:Issuer"],
        //            audience: _config["Jwt:Audience"],
        //            expires: DateTime.Now.AddHours(3),
        //            claims: authClaims,
        //            signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
        //        );

        //        var finalToken = new JwtSecurityTokenHandler().WriteToken(token);
        //        return Results.Ok(finalToken);
        //    }

        //    return Results.Unauthorized();
        //});

        app.Run();
    }
}