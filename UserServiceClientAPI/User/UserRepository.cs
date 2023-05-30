using Google.Protobuf.WellKnownTypes;
using Grpc.Core;
using UserServiceClient;
using System.Data;
using UserServiceClientAPI.User;
using Microsoft.Extensions.Configuration;

public class UserRepository : IUserRepository
{
    private readonly UserService.UserServiceClient _client;
    private readonly IConfiguration _configuration;

    public UserRepository(IConfiguration configuration)
    {
        _configuration = configuration;
        var host = _configuration["GrpcService:Host"];
        var port = _configuration["GrpcService:Port"];
        var channel = new Channel($"{host}:{port}", ChannelCredentials.Insecure);
        _client = new UserService.UserServiceClient(channel);
    }

    public async Task<string> Create(UserDTOCreate user)
    {
        var request = new UserCreate
        {
            Firstname = user.Firstname,
            Lastname = user.Lastname,
            Email = user.Email,
            Password = user.Password
        };

        var response = await _client.createUserAsync(request);
        return response.UUID;
    }

    public async Task<IEnumerable<UserDTO>> GetAll()
    {
        var request = new Google.Protobuf.WellKnownTypes.Empty();

        var response = await _client.getAllUsersAsync(request);
        return response.Users.Select(user =>
            new UserDTO
            {
                UserGuid = user.UserGuid,
                Firstname = user.Firstname,
                Lastname = user.Lastname,
                Email = user.Email,
                Password = user.Password,
                CreatedDate = DateTimeOffset.FromUnixTimeMilliseconds(user.CreatedDate).DateTime
            }
        );
    }

    public async Task<UserDTO> GetByUserEmail(string userEmail)
    {
        var request = new UserServiceClient.UserEmail
        {
            Email = userEmail
        };

        var response = await _client.getUserByEmailAsync(request);

        return new UserDTO
        {
            UserGuid = response.UserGuid,
            Firstname = response.Firstname,
            Lastname = response.Lastname,
            Email = response.Email,
            CreatedDate = DateTimeOffset.FromUnixTimeMilliseconds(response.CreatedDate).DateTime
        };
    }

    public async Task<UserDTO> GetByUserGuid(string userGuid)
    {
        Console.WriteLine(userGuid);

        var request = new UserServiceClient.Userid
        {
            UUID = userGuid
        };

        Console.WriteLine(request.UUID);

        var response = await _client.getUserByIdAsync(request);
        return new UserDTO
        {
            UserGuid = response.UserGuid,
            Firstname = response.Firstname,
            Lastname = response.Lastname,
            Email = response.Email,
            CreatedDate = DateTimeOffset.FromUnixTimeMilliseconds(response.CreatedDate).DateTime
        };
    }

    public async Task<string> GetByCredentials(UserDTOCredentials userCredintials)
    {
        var request = new UserServiceClient.UserValidationRequest
        {
            Email = userCredintials.Email,
            Password = userCredintials.Password
        };

        Console.WriteLine(request.Email);

        var response = await _client.validateUserAsync(request);
        return response.UUID;
    }

    public void Delete(Guid userGuid)
    {
        var request = new Userid
        {
            UUID = userGuid.ToString()
        };

        _client.deleteUser(request);
    }
}




