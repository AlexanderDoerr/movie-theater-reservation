using Google.Protobuf.WellKnownTypes;
using Grpc.Core;
using UserServiceClient;
using System.Data;
using UserServiceClientAPI.User;

public class UserRepository : IUserRepository
{
    private readonly UserService.UserServiceClient _client;

    public UserRepository()
    {
        var channel = new Channel("Sql-gRPC-Service:50052", ChannelCredentials.Insecure);
        _client = new UserService.UserServiceClient(channel);
    }

    public async Task<UserDTOGuid> Create(UserDTOCreate user)
    {
        var request = new UserCreate
        {
            Firstname = user.Firstname.ToString(),
            Lastname = user.Lastname.ToString(),
            Email = user.Email.ToString(),
            Password = user.Password.ToString(),
        };

        var response = await _client.createUserAsync(request);
        return new UserDTOGuid
        {
            UserGuid = response.UUID.ToString(),
        };
    }

    public async Task<IEnumerable<User>> GetAll()
    {
        var request = new Google.Protobuf.WellKnownTypes.Empty();

        var response = await _client.getAllUsersAsync(request);
        return response.Users.Select(user =>
            new User
            {
                UserGuid = user.UserGuid,
                Firstname = user.Firstname,
                Lastname = user.Lastname,
                Email = user.Email,
                Password = user.Password,
                CreatedDate = user.CreatedDate.ToDateTime()
            }
        );
    }

    public async Task<User> GetByUserEmail(string userEmail)
    {
        var request = new UserServiceClient.UserEmail
        {
            Email = userEmail
        };

        var response = await _client.getUserByEmailAsync(request);
        return new User
        {
            UserGuid = response.UserGuid,
            Firstname = response.Firstname,
            Lastname = response.Lastname,
            Email = response.Email,
            CreatedDate = response.CreatedDate.ToDateTime()
        };
    }

    public async Task<User> GetByUserGuid(string userGuid)
    {
        var request = new UserServiceClient.Userid
        {
            UUID = userGuid.ToString(),
        };

        var response = await _client.getUserByIdAsync(request);
        return new User
        {
            UserGuid = response.UserGuid.ToString(),
            Firstname = response.Firstname.ToString(),
            Lastname = response.Lastname.ToString(),
            Email = response.Email.ToString(),
            CreatedDate = response.CreatedDate.ToDateTime()
        };
    }

    public async Task<UserDTOGuid> GetByCredentials(UserDTOCredentials userCredintials)
    {
        var request = new UserServiceClient.UserValidationRequest
        {
            Email = userCredintials.Email,
            Password = userCredintials.Password
        };

        var response = await _client.validateUserAsync(request);
        return new UserDTOGuid
        {
            UserGuid = response.UUID
        };
    }

    public void Delete(Guid userGuid)
    {
        var request = new Userid
        {
            Uuid = userGuid.ToString()
        };

        _client.deleteUser(request);
    }
}