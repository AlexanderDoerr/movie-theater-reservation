namespace UserServiceClientAPI.User
{
    public class UserDTOAuth
    {
        string base64JWT;
        string userUuid;

        public UserDTOAuth(string base64JWT, string userUuid)
        {
            this.base64JWT = base64JWT;
            this.userUuid = userUuid;
        }
    }
}
