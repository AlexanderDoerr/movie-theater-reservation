using Google.Protobuf.WellKnownTypes;
using Grpc.Core;
using UserServiceClient;
using System.Data;

public class UserRepository : IUserRepository
{
    private readonly UserService.UserServiceClient _client;

    public UserRepository()
    {
        var channel = new Channel("localhost:5001", ChannelCredentials.Insecure);
        _client = new UserService.UserServiceClient(channel);
    }

    public async Task<Guid> Create(UserDTOCreate user)
    {
        var request = new UserCreate
        {
            Firstname = user.Firstname,
            Lastname = user.Lastname,
            Email = user.Email,
            Password = user.Password
        };

        var response = await _client.createUserAsync(request);
        return Guid.Parse(response.UUID);
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
            UserGuid = Guid.Parse(response.UserGuid),
            Firstname = response.Firstname,
            Lastname = response.Lastname,
            Email = response.Email,
            Password = response.Password,
            CreatedDate = response.CreatedDate.ToDateTime()
        };
    }

    public async Task<IEnumerable<User>> GetAll()
    {
        var request = new Google.Protobuf.WellKnownTypes.Empty();

        var response = await _client.getAllUsersAsync(request);
        return response.Users.Select(user =>
            new User
            {
                UserGuid = Guid.Parse(user.UserGuid),
                Firstname = user.Firstname,
                Lastname = user.Lastname,
                Email = user.Email,
                Password = user.Password,
                CreatedDate = user.CreatedDate.ToDateTime()
            }
        );
    }

    public async Task<User> GetByUserGuid(Guid userGuid)
    {
        var request = new userRequest
        {
            UUID = userGuid.ToString()
        };

        var response = await _client.getUserByIdAsync(request);

        // Convert the generated User type to your User type
        var user = new User
        {
            UserGuid = userGuid,
            Firstname = response.Firstname,
            Lastname = response.Lastname,
            Email = response.Email,
            Password = response.Password
        };

        return user;
    }

    public async Task<User> GetByCredentials(string email, string userPassword)
    {
        var request = new UserValidationRequest
        {
            Email = email,
            Password = userPassword
        };

        var response = await _client.validateUserAsync(request);

        var user = new User
        {
            UserGuid = Guid.Parse(response.UserGuid.ToString()),
            Firstname = response.Firstname,
            Lastname = response.Lastname,
            Email = response.Email,
            Password = response.Password
        };

        return user;
    }

    public void Delete(Guid userGuid)
    {
        var request = new userRequest
        {
            UUID = userGuid.ToString()
        };

        _client.deleteUser(request);
    }
}