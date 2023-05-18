public interface IUserRepository
{
    public Task<Guid> Create(UserDTOCreate user);
    public void Delete(Guid UserGuid);
    public Task<User> GetByUserEmail(String userEmail);
    public Task<IEnumerable<User>> GetAll();
    public Task<User> GetByUserGuid(Guid userGuid);
    public Task<User> GetByCredentials(String userEmail, String userPassword);
}