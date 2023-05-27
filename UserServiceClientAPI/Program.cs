using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

//consul
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using Consul;

internal class Program
{
    private static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        builder.Services.AddScoped<IUserRepository, UserRepository>();

        builder.Services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(o =>
        {
            o.SaveToken = true;
            o.RequireHttpsMetadata = false;

            o.TokenValidationParameters = new TokenValidationParameters
            {
                ValidIssuer = builder.Configuration["Jwt:Issuer"],
                ValidAudience = builder.Configuration["Jwt:Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"])),
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = false,
                ValidateIssuerSigningKey = true
            };
        });

        builder.Services.AddAuthorization();
        // Add services to the container.

        builder.Services.AddControllers();
        // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();



        var app = builder.Build();

        var consulConfig = builder.Configuration.GetSection("Consul").Get<ConsulConfig>();

        if (consulConfig.Register)
        {
            var consulClient = new ConsulClient(config =>
            {
                config.Address = new Uri($"http://{consulConfig.Host}:{consulConfig.Port}");
            });

            var registration = new AgentServiceRegistration
            {
                ID = Guid.NewGuid().ToString(),
                Name = consulConfig.Service.Name,
                Address = consulConfig.Service.Address,
                Port = consulConfig.Service.Port,
                Tags = consulConfig.Service.Tags.ToArray()
            };

            consulClient.Agent.ServiceRegister(registration).GetAwaiter().GetResult();

            var lifetime = app.Services.GetRequiredService<IHostApplicationLifetime>();
            lifetime.ApplicationStopping.Register(() =>
            {
                consulClient.Agent.ServiceDeregister(registration.ID).GetAwaiter().GetResult();
            });
        }

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

        app.MapPost("/security/createToken2", [AllowAnonymous] async (User user, IConfiguration _config, IUserRepository _userRepository) =>
        {
            //if (user.Email == "ccantera@yahoo.com" && user.Password == "pwd123")
            User uu = await _userRepository.GetByCredentials(user.Email, user.Password);

            if (uu != null)
            {
                var authClaims = new List<Claim> { new(ClaimTypes.Name, user.UserGuid.ToString()), new(ClaimTypes.Email, user.Email), };
                var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));

                var token = new JwtSecurityToken(
                    issuer: _config["Jwt:Issuer"],
                    audience: _config["Jwt:Audience"],
                    expires: DateTime.Now.AddHours(3),
                    claims: authClaims,
                    signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
                );

                var finalToken = new JwtSecurityTokenHandler().WriteToken(token);
                return Results.Ok(finalToken);
            }

            return Results.Unauthorized();
        });

        app.Run();
    }

    public class ConsulConfig
    {
        public string Host { get; set; }
        public int Port { get; set; }
        public ConsulServiceConfig Service { get; set; }
        public bool Register { get; set; }
    }

    public class ConsulServiceConfig
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public List<string> Tags { get; set; }
        public string Address { get; set; }
        public int Port { get; set; }
    }
}