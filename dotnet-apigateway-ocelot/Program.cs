
using Ocelot.Cache.CacheManager;
using Ocelot.DependencyInjection;
using Ocelot.LoadBalancer.LoadBalancers;
using Ocelot.Middleware;
using Ocelot.Responses;
using Ocelot.Values;

using Ocelot.Provider.Eureka;
using Ocelot.Provider.Polly;
using Steeltoe.Discovery.Client;


var builder = WebApplication.CreateBuilder(args);


// you can use this style...
IConfiguration configuration = new ConfigurationBuilder().AddJsonFile("ocelot.json").Build();
//IConfiguration configuration = new ConfigurationBuilder().AddJsonFile($"ocelot.{builder.Environment.EnvironmentName}.json", true, true).Build();
builder.Services.AddOcelot(configuration)
.AddEureka()
.AddPolly();



/* builder.Host.ConfigureAppConfiguration((hostingContext, config) =>
{
    config.SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddEnvironmentVariables();
});
 */


// or this style
//builder.Configuration.AddJsonFile("ocelot.json");
//builder.Services.AddOcelot().AddEureka().AddPolly();


builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// eureka
builder.Services.AddDiscoveryClient(builder.Configuration);
builder.Services.AddCors();

var app = builder.Build();


if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}


app.UseHttpsRedirection();

app.UseCors(b => b.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());


// ocelot
await app.UseOcelot();

app.MapGet("/", () => "Hello World!");

app.Run();
