using Confluent.Kafka;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using UserServiceClient;
using UserServiceClientAPI.User;

[ApiController]
[Route("[controller]")]
public class UserController : ControllerBase
{
    private readonly ILogger<UserController> _logger;
    private readonly IUserRepository _userRepository;
    private readonly IConfiguration _config;

    public UserController(ILogger<UserController> logger, IUserRepository userRepository, IConfiguration config)
    {
        _logger = logger;
        _userRepository = userRepository;
        _config = config;
    }

    [HttpPost]
    public async Task<IActionResult> Create(UserDTOCreate user)
    {
        //Guid userGuid = new Guid("E8E369C0-960B-4584-9A81-F9FF9F98DBD6");
        try
        {
            string userGuid = await _userRepository.Create(user);

            if(userGuid == "")
            {
                return Ok(new
                {
                    Success = false,
                    Message = "User already exists"
                });
            } else
            {
                return Ok(new
                {
                    Success = true,
                    Message = "User created.",
                    UserGuid = userGuid
                });
            }



        } catch (Exception e)
        {
            //return Ok("something happened");
            return Ok(e.Message);
        }
    }

    [HttpGet]
    //[Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var Data = await _userRepository.GetAll();
            return Ok(new
            {
                Success = true,
                Message = "all users returned.",
                Data
            });
        } catch (Exception ex)
        {
            Console.WriteLine(ex.Message);
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPost("profile/{userGuid}")]
    [Authorize]
    public async Task<IActionResult> GetById(string userGuid, UserDTOCredentials credentials)
    {
        //Console.WriteLine($"{userGuid}");
        var userId = await _userRepository.GetByCredentials(credentials);

        try
        {
            if (userGuid != userId)
            {
                return Unauthorized(new
                {
                    Success = false,
                    Message = "You are not authorized to access this profile."
                });
            }

            var user = await _userRepository.GetByUserGuid(userGuid.ToString());

            if (user == null)
            {
                return NotFound(new
                {
                    Success = false,
                    Message = "User not found."
                });
            }

            return Ok(new
            {
                Success = true,
                Message = "User fetched successfully.",
                Data = user
            });
        } catch (Exception ex)
        {
            Console.WriteLine(ex.Message);
            return StatusCode(500, ex.Message);
        }
    }

    [HttpDelete("{userGuid}")]
    //[Authorize]
    public IActionResult Delete(Guid userGuid)
    {
        try
        {
            _userRepository.Delete(userGuid);
            return Ok(new
            {
                Success = true,
                Message = "User deleted successfully."
            });
        } catch (Exception ex)
        {
            Console.WriteLine(ex.Message);
            return StatusCode(500, ex.Message);
        }
    }

    [HttpGet("email/{userEmail}")]
    //[Authorize]
    public async Task<IActionResult> GetByUserEmail(string userEmail)
    {
        try
        {
            var user = await _userRepository.GetByUserEmail(userEmail);

            if (user == null)
            {
                return NotFound(new
                {
                    Success = false,
                    Message = "User not found."
                });
            }

            return Ok(new
            {
                Success = true,
                Message = "User fetched successfully.",
                Data = user
            });
        } catch (Exception ex)
        {
            Console.WriteLine(ex.Message);
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPost]
    [Route("login")]
    public async Task<IActionResult> GetUserByCredentials(UserDTOCredentials credentials)
    {
        try
        {
            var userId = await _userRepository.GetByCredentials(credentials);

            if (userId == null)
            {
                return Ok(new
                {
                    Success = false,
                    Message = "User not authenticated, email or password is wrong"
                });
            } else
            {
                var authClaims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, userId.ToString()),
                new Claim(ClaimTypes.Email, credentials.Email)
            };
                var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));

                var token = new JwtSecurityToken(
                    issuer: _config["Jwt:Issuer"],
                    audience: _config["Jwt:Audience"],
                    expires: DateTime.Now.AddHours(3),
                    claims: authClaims,
                    signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
                );

                var jwtHandler = new JwtSecurityTokenHandler();
                var finalToken = jwtHandler.WriteToken(token);

                return Ok(new
                {
                    Success = true,
                    Message = "User authenticated",
                    Token = finalToken,
                    UserId = userId.ToString()
                });
            }
        } catch (Exception ex)
        {
            Console.WriteLine(ex.Message);
            return StatusCode(500, ex.Message);
        }
    }
}