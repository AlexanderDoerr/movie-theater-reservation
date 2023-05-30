namespace UserServiceClientAPI.User
{
    public class UserDTOAuth
    {
        string base64JWT;
        string userGuid;

        public UserDTOAuth(string base64JWT, string userGuid)
        {
            this.base64JWT = base64JWT;
            this.userGuid = userGuid;
        }
    }
}
