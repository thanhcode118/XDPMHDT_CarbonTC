// CarbonTC.Auth.Api/Controllers/AuthController.cs

using CarbonTC.Auth.Application.Features.Auth.Commands.LoginUser;
using CarbonTC.Auth.Application.Features.Auth.Commands.Logout;
using CarbonTC.Auth.Application.Features.Auth.Commands.RefreshToken;
using CarbonTC.Auth.Application.Features.Auth.Commands.RegisterUser;
using CarbonTC.Auth.Domain.Common;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CarbonTC.Auth.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IMediator mediator, ILogger<AuthController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Đăng ký tài khoản mới
    /// </summary>
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterUserCommand command)
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

            var result = await _mediator.Send(command);

            return Ok(ApiResponse<object>.SuccessResult(
                result,
                "Đăng ký thành công"
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during registration");
            return StatusCode(500, ApiResponse<object>.ErrorResult(
                "Đã xảy ra lỗi trong quá trình đăng ký",
                ex.Message
            ));
        }
    }

    /// <summary>
    /// Đăng nhập
    /// </summary>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginUserCommand command)
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

            var result = await _mediator.Send(command);

            return Ok(ApiResponse<object>.SuccessResult(
                result,
                "Đăng nhập thành công"
            ));
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ApiResponse<object>.ErrorResult(
                "Đăng nhập thất bại",
                ex.Message
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login");
            return StatusCode(500, ApiResponse<object>.ErrorResult(
                "Đã xảy ra lỗi trong quá trình đăng nhập",
                ex.Message
            ));
        }
    }

    /// <summary>
    /// Làm mới access token
    /// </summary>
    [HttpPost("refresh-token")]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenCommand command)
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

            var result = await _mediator.Send(command);

            return Ok(ApiResponse<object>.SuccessResult(
                result,
                "Token đã được làm mới"
            ));
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ApiResponse<object>.ErrorResult(
                "Làm mới token thất bại",
                ex.Message
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error refreshing token");
            return StatusCode(500, ApiResponse<object>.ErrorResult(
                "Đã xảy ra lỗi trong quá trình làm mới token",
                ex.Message
            ));
        }
    }

    /// <summary>
    /// Đăng xuất khỏi thiết bị hiện tại
    /// </summary>
    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout([FromBody] LogoutCommand command)
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

            await _mediator.Send(command);

            return Ok(ApiResponse.SuccessResult("Đăng xuất thành công"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during logout");
            return StatusCode(500, ApiResponse.ErrorResult(
                "Đã xảy ra lỗi trong quá trình đăng xuất",
                ex.Message
            ));
        }
    }

    /// <summary>
    /// Đăng xuất khỏi tất cả thiết bị
    /// </summary>
    [HttpPost("logout-all")]
    [Authorize]
    public async Task<IActionResult> LogoutAll()
    {
        try
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(ApiResponse.ErrorResult(
                    "Không thể xác thực người dùng",
                    "UserId không hợp lệ"
                ));
            }

            // TODO: Implement LogoutAllCommand với userId

            return Ok(ApiResponse.SuccessResult("Đã đăng xuất khỏi tất cả thiết bị"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during logout all");
            return StatusCode(500, ApiResponse.ErrorResult(
                "Đã xảy ra lỗi trong quá trình đăng xuất tất cả thiết bị",
                ex.Message
            ));
        }
    }
}