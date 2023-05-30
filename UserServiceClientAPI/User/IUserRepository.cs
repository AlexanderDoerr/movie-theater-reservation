using UserServiceClientAPI.User;

public interface IUserRepository
{
    public Task<string> Create(UserDTOCreate user);
    public void Delete(Guid UserGuid);
    public Task<UserDTO> GetByUserEmail(string userEmail);
    public Task<IEnumerable<UserDTO>> GetAll();
    public Task<UserDTO> GetByUserGuid(string userGuid);
    public Task<string> GetByCredentials(UserDTOCredentials userCredintials);
}