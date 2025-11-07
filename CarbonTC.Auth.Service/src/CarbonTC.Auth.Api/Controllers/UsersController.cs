// CarbonTC.Auth.Api/Controllers/UsersController.cs
using CarbonTC.Auth.Application.Features.Users.Queries.GetPendingVerifiers; // ✅ THÊM DÒNG NÀY
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

    #region Profile Management (All Authenticated Users)

    /// <summary>
    /// Lấy thông tin người dùng hiện tại
    /// </summary>
    /// <remarks>
    /// Tất cả người dùng đã đăng nhập có thể xem thông tin của chính họ
    /// </remarks>
    [HttpGet("profile")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 401)]
    [ProducesResponseType(typeof(ApiResponse<object>), 500)]
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
            _logger.LogError(ex, "Error getting profile for user");
            return StatusCode(500, ApiResponse<object>.ErrorResult(
                "Đã xảy ra lỗi trong quá trình lấy thông tin cá nhân",
                ex.Message
            ));
        }
    }

    /// <summary>
    /// Cập nhật thông tin cá nhân
    /// </summary>
    /// <remarks>
    /// Tất cả người dùng có thể cập nhật thông tin của chính họ
    /// </remarks>
    [HttpPut("profile")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 400)]
    [ProducesResponseType(typeof(ApiResponse<object>), 500)]
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
    /// <remarks>
    /// Tất cả người dùng có thể đổi mật khẩu của chính họ
    /// </remarks>
    [HttpPost("change-password")]
    [ProducesResponseType(typeof(ApiResponse), 200)]
    [ProducesResponseType(typeof(ApiResponse), 400)]
    [ProducesResponseType(typeof(ApiResponse), 401)]
    [ProducesResponseType(typeof(ApiResponse), 500)]
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
    /// <remarks>
    /// Tất cả người dùng có thể xóa tài khoản của chính họ
    /// </remarks>
    [HttpDelete("profile")]
    [ProducesResponseType(typeof(ApiResponse), 200)]
    [ProducesResponseType(typeof(ApiResponse), 500)]
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

    #endregion

    #region Admin Only - User Management

    /// <summary>
    /// Lấy thông tin người dùng theo ID (Admin only)
    /// </summary>
    /// <remarks>
    /// Chỉ Admin mới có thể xem thông tin chi tiết của bất kỳ người dùng nào
    /// </remarks>
    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 403)]
    [ProducesResponseType(typeof(ApiResponse<object>), 404)]
    [ProducesResponseType(typeof(ApiResponse<object>), 500)]
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
    /// <remarks>
    /// Chỉ Admin mới có thể xem danh sách tất cả người dùng trong hệ thống
    /// </remarks>
    /// <param name="pageNumber">Số trang (mặc định: 1)</param>
    /// <param name="pageSize">Kích thước trang (mặc định: 10)</param>
    /// <param name="searchTerm">Từ khóa tìm kiếm (email, tên, số điện thoại)</param>
    /// <param name="role">Lọc theo role (Admin, EVOwner, CreditBuyer, Verifier)</param>
    /// <param name="status">Lọc theo trạng thái (Active, Inactive, PendingApproval, etc.)</param>
    [HttpGet]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 400)]
    [ProducesResponseType(typeof(ApiResponse<object>), 403)]
    [ProducesResponseType(typeof(ApiResponse<object>), 500)]
    public async Task<IActionResult> GetAllUsers(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? searchTerm = null,
        [FromQuery] string? role = null,
        [FromQuery] string? status = null)
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

            if (pageSize > 100)
            {
                return BadRequest(ApiResponse<object>.ErrorResult(
                    "Tham số không hợp lệ",
                    "Kích thước trang không được vượt quá 100"
                ));
            }

            var result = await _mediator.Send(new GetAllUsersQuery(
                pageNumber,
                pageSize,
                searchTerm
            // TODO: Thêm role và status filter nếu cần
            ));

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
    /// <remarks>
    /// Chỉ Admin mới có thể xóa người dùng khác (soft delete)
    /// </remarks>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse), 200)]
    [ProducesResponseType(typeof(ApiResponse), 400)]
    [ProducesResponseType(typeof(ApiResponse), 403)]
    [ProducesResponseType(typeof(ApiResponse), 404)]
    [ProducesResponseType(typeof(ApiResponse), 500)]
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
                    "Vui lòng sử dụng tài khoản admin khác để thực hiện thao tác này"
                ));
            }

            await _mediator.Send(new DeleteUserCommand(id));

            _logger.LogInformation("Admin {AdminId} deleted user {UserId}", currentUserId, id);

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

    #endregion

    #region Admin & Verifier - Approval Management

    /// <summary>
    /// Phê duyệt tài khoản Verifier (Admin only)
    /// </summary>
    /// <remarks>
    /// Admin phê duyệt tài khoản Verifier đang ở trạng thái PendingApproval
    /// </remarks>
    [HttpPost("{id:guid}/approve")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse), 200)]
    [ProducesResponseType(typeof(ApiResponse), 400)]
    [ProducesResponseType(typeof(ApiResponse), 403)]
    [ProducesResponseType(typeof(ApiResponse), 404)]
    [ProducesResponseType(typeof(ApiResponse), 500)]
    public async Task<IActionResult> ApproveVerifier(Guid id)
    {
        try
        {
            // TODO: Implement ApproveVerifierCommand
            // var result = await _mediator.Send(new ApproveVerifierCommand(id));

            _logger.LogInformation("Admin approved Verifier: {UserId}", id);

            return Ok(ApiResponse.SuccessResult(
                "Phê duyệt tài khoản Verifier thành công"
            ));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.ErrorResult(
                "Không tìm thấy người dùng",
                ex.Message
            ));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse.ErrorResult(
                "Không thể phê duyệt",
                ex.Message
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error approving Verifier: {UserId}", id);
            return StatusCode(500, ApiResponse.ErrorResult(
                "Đã xảy ra lỗi trong quá trình phê duyệt",
                ex.Message
            ));
        }
    }

    /// <summary>
    /// Từ chối tài khoản Verifier (Admin only)
    /// </summary>
    /// <remarks>
    /// Admin từ chối tài khoản Verifier đang ở trạng thái PendingApproval
    /// </remarks>
    [HttpPost("{id:guid}/reject")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse), 200)]
    [ProducesResponseType(typeof(ApiResponse), 400)]
    [ProducesResponseType(typeof(ApiResponse), 403)]
    [ProducesResponseType(typeof(ApiResponse), 404)]
    [ProducesResponseType(typeof(ApiResponse), 500)]
    public async Task<IActionResult> RejectVerifier(Guid id, [FromBody] string? reason)
    {
        try
        {
            // TODO: Implement RejectVerifierCommand
            // var result = await _mediator.Send(new RejectVerifierCommand(id, reason));

            _logger.LogInformation("Admin rejected Verifier: {UserId}, Reason: {Reason}", id, reason);

            return Ok(ApiResponse.SuccessResult(
                "Từ chối tài khoản Verifier thành công"
            ));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.ErrorResult(
                "Không tìm thấy người dùng",
                ex.Message
            ));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse.ErrorResult(
                "Không thể từ chối",
                ex.Message
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error rejecting Verifier: {UserId}", id);
            return StatusCode(500, ApiResponse.ErrorResult(
                "Đã xảy ra lỗi trong quá trình từ chối",
                ex.Message
            ));
        }
    }

    /// <summary>
    /// Lấy danh sách Verifier đang chờ phê duyệt (Admin only)
    /// </summary>
    [HttpGet("pending-verifiers")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 403)]
    [ProducesResponseType(typeof(ApiResponse<object>), 500)]
    public async Task<IActionResult> GetPendingVerifiers(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
    {
        try
        {
            var result = await _mediator.Send(new GetPendingVerifiersQuery(pageNumber, pageSize));

            return Ok(ApiResponse<object>.SuccessResult(
                result,
                $"Lấy danh sách Verifier chờ duyệt thành công. Tìm thấy {result.TotalCount} tài khoản."
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting pending verifiers");
            return StatusCode(500, ApiResponse<object>.ErrorResult(
                "Đã xảy ra lỗi trong quá trình lấy danh sách",
                ex.Message
            ));
        }
    }

    #endregion

    #region Role-Based Statistics (Admin only)

    /// <summary>
    /// Thống kê người dùng theo role (Admin only)
    /// </summary>
    [HttpGet("statistics")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 403)]
    [ProducesResponseType(typeof(ApiResponse<object>), 500)]
    public async Task<IActionResult> GetUserStatistics()
    {
        try
        {
            // TODO: Implement GetUserStatisticsQuery
            // var result = await _mediator.Send(new GetUserStatisticsQuery());

            return Ok(ApiResponse<object>.SuccessResult(
                new
                {
                    totalUsers = 0,
                    byRole = new
                    {
                        admin = 0,
                        evOwner = 0,
                        creditBuyer = 0,
                        verifier = 0
                    },
                    byStatus = new
                    {
                        active = 0,
                        inactive = 0,
                        pendingApproval = 0,
                        locked = 0
                    }
                },
                "Lấy thống kê người dùng thành công"
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user statistics");
            return StatusCode(500, ApiResponse<object>.ErrorResult(
                "Đã xảy ra lỗi trong quá trình lấy thống kê",
                ex.Message
            ));
        }
    }

    #endregion

    #region Helper Methods

    /// <summary>
    /// Lấy UserId từ JWT token
    /// </summary>
    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim))
        {
            throw new UnauthorizedAccessException("User ID not found in token");
        }
        return Guid.Parse(userIdClaim);
    }

    /// <summary>
    /// Lấy Role từ JWT token
    /// </summary>
    private string GetCurrentUserRole()
    {
        var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value;
        return roleClaim ?? "Unknown";
    }

    /// <summary>
    /// Kiểm tra xem user hiện tại có phải là Admin không
    /// </summary>
    private bool IsAdmin()
    {
        return User.IsInRole("Admin");
    }

    #endregion
}