using UserServiceClientAPI.User;

public interface IUserRepository
{
    public Task<UserDTOGuid> Create(UserDTOCreate user);
    public void Delete(Guid UserGuid);
    public Task<User> GetByUserEmail(string userEmail);
    public Task<IEnumerable<User>> GetAll();
    public Task<User> GetByUserGuid(string userGuid);
    public Task<UserDTOGuid> GetByCredentials(UserDTOCredentials userCredintials);
}