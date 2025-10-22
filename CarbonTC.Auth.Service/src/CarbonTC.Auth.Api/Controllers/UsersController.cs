// CarbonTC.Auth.Api/Controllers/UsersController.cs

using CarbonTC.Auth.Application.Features.Users.Commands.ChangePassword;
using CarbonTC.Auth.Application.Features.Users.Commands.DeleteUser;
using CarbonTC.Auth.Application.Features.Users.Commands.UpdateProfile;
using CarbonTC.Auth.Application.Features.Users.Queries.GetAllUsers;
using CarbonTC.Auth.Application.Features.Users.Queries.GetCurrentUser;
using CarbonTC.Auth.Application.Features.Users.Queries.GetUserById;
using CarbonTC.Auth.Domain.Common;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CarbonTC.Auth.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<UsersController> _logger;

    public UsersController(IMediator mediator, ILogger<UsersController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Lấy thông tin người dùng hiện tại
    /// </summary>
    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        try
        {
            var userId = GetCurrentUserId();
            var result = await _mediator.Send(new GetCurrentUserQuery(userId));

            return Ok(ApiResponse<object>.SuccessResult(
                result,
                "Lấy thông tin cá nhân thành công"
            ));
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ApiResponse<object>.ErrorResult(
                "Không thể xác thực người dùng",
                ex.Message
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting profile");
            return StatusCode(500, ApiResponse<object>.ErrorResult(
                "Đã xảy ra lỗi trong quá trình lấy thông tin cá nhân",
                ex.Message
            ));
        }
    }

    /// <summary>
    /// Cập nhật thông tin cá nhân
    /// </summary>
    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileCommand command)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();

                return BadRequest(ApiResponse<object>.ErrorResult(
                    "Dữ liệu không hợp lệ",
                    errors
                ));
            }

            var userId = GetCurrentUserId();
            var updatedCommand = command with { UserId = userId };
            var result = await _mediator.Send(updatedCommand);

            return Ok(ApiResponse<object>.SuccessResult(
                result,
                "Cập nhật thông tin thành công"
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating profile");
            return StatusCode(500, ApiResponse<object>.ErrorResult(
                "Đã xảy ra lỗi trong quá trình cập nhật thông tin",
                ex.Message
            ));
        }
    }

    /// <summary>
    /// Đổi mật khẩu
    /// </summary>
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordCommand command)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();

                return BadRequest(ApiResponse.ErrorResult(
                    "Dữ liệu không hợp lệ",
                    errors
                ));
            }

            var userId = GetCurrentUserId();
            var updatedCommand = command with { UserId = userId };
            await _mediator.Send(updatedCommand);

            return Ok(ApiResponse.SuccessResult(
                "Đổi mật khẩu thành công. Vui lòng đăng nhập lại trên tất cả thiết bị"
            ));
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ApiResponse.ErrorResult(
                "Mật khẩu hiện tại không đúng",
                ex.Message
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error changing password");
            return StatusCode(500, ApiResponse.ErrorResult(
                "Đã xảy ra lỗi trong quá trình đổi mật khẩu",
                ex.Message
            ));
        }
    }

    /// <summary>
    /// Xóa tài khoản cá nhân
    /// </summary>
    [HttpDelete("profile")]
    public async Task<IActionResult> DeleteProfile()
    {
        try
        {
            var userId = GetCurrentUserId();
            await _mediator.Send(new DeleteUserCommand(userId));

            return Ok(ApiResponse.SuccessResult("Xóa tài khoản thành công"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting profile");
            return StatusCode(500, ApiResponse.ErrorResult(
                "Đã xảy ra lỗi trong quá trình xóa tài khoản",
                ex.Message
            ));
        }
    }

    /// <summary>
    /// Lấy thông tin người dùng theo ID (Admin only)
    /// </summary>
    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetUserById(Guid id)
    {
        try
        {
            var result = await _mediator.Send(new GetUserByIdQuery(id));

            return Ok(ApiResponse<object>.SuccessResult(
                result,
                "Lấy thông tin người dùng thành công"
            ));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<object>.ErrorResult(
                "Không tìm thấy người dùng",
                new List<string> { "UserId không hợp lệ", ex.Message }
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user by ID: {UserId}", id);
            return StatusCode(500, ApiResponse<object>.ErrorResult(
                "Đã xảy ra lỗi trong quá trình lấy thông tin người dùng",
                ex.Message
            ));
        }
    }

    /// <summary>
    /// Lấy danh sách tất cả người dùng (Admin only)
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllUsers(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? searchTerm = null)
    {
        try
        {
            if (pageNumber < 1 || pageSize < 1)
            {
                return BadRequest(ApiResponse<object>.ErrorResult(
                    "Tham số không hợp lệ",
                    new List<string> {
                        "Số trang phải lớn hơn 0",
                        "Kích thước trang phải lớn hơn 0"
                    }
                ));
            }

            var result = await _mediator.Send(new GetAllUsersQuery(pageNumber, pageSize, searchTerm));

            return Ok(ApiResponse<object>.SuccessResult(
                result,
                "Lấy danh sách người dùng thành công"
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all users");
            return StatusCode(500, ApiResponse<object>.ErrorResult(
                "Đã xảy ra lỗi trong quá trình lấy danh sách người dùng",
                ex.Message
            ));
        }
    }

    /// <summary>
    /// Xóa người dùng (Admin only)
    /// </summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteUser(Guid id)
    {
        try
        {
            // Prevent admin from deleting themselves
            var currentUserId = GetCurrentUserId();
            if (currentUserId == id)
            {
                return BadRequest(ApiResponse.ErrorResult(
                    "Không thể xóa tài khoản của chính mình",
                    "Vui lòng sử dụng tài khoản admin khác"
                ));
            }

            await _mediator.Send(new DeleteUserCommand(id));

            return Ok(ApiResponse.SuccessResult("Xóa người dùng thành công"));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.ErrorResult(
                "Không tìm thấy người dùng",
                ex.Message
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting user: {UserId}", id);
            return StatusCode(500, ApiResponse.ErrorResult(
                "Đã xảy ra lỗi trong quá trình xóa người dùng",
                ex.Message
            ));
        }
    }

    // Helper method
    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim))
        {
            throw new UnauthorizedAccessException("User ID not found in token");
        }
        return Guid.Parse(userIdClaim);
    }
}