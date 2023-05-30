using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using UserServiceClientAPI.User;

[ApiController]
[Route("[controller]")]
public class UserController : ControllerBase
{
    private readonly ILogger<UserController> _logger;
    private readonly IUserRepository _userRepository;

    public UserController(ILogger<UserController> logger, IUserRepository userRepository)
    {
        _logger = logger;
        _userRepository = userRepository;
    }

    [HttpPost]
    public async Task<IActionResult> Create(UserDTOCreate user)
    {
        //Guid userGuid = new Guid("E8E369C0-960B-4584-9A81-F9FF9F98DBD6");
        try
        {
            //User uu = await _userRepository.GetByUserEmail(user.Email);
            ////Console.WriteLine(uu);

            //if (uu != null)
            //{
            //    return Ok(new
            //    {
            //        Success = true,
            //        Message = "User already exists!",
            //        //UserGuid = uu.UserGuid,
            //        //Email = uu.Email
            //    });
            //}

            Console.WriteLine(user.ToString());

            UserDTOGuid userGuid = await _userRepository.Create(user);

            return Ok(new
            {
                //Success = true,
                //Message = "User created.",
                UserGuid = userGuid
            });

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

    [HttpGet("id/{userGuid}")]
    //[Authorize]
    public async Task<IActionResult> GetById(string userGuid)
    {
        try
        {
            User user = await _userRepository.GetByUserGuid(userGuid);

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

    [HttpGet]
    [Route("login")]
    public async Task<IActionResult> GetUserByCredentials(UserDTOCredentials credentials)
    {
        try
        {
            var Data = await _userRepository.GetByCredentials(credentials);
            return Ok(new
            {
                Success = true,
                Message = "User authenticated",
                Data
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



}