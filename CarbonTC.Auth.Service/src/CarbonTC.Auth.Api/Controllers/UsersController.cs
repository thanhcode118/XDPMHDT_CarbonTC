// CarbonTC.Auth.Api/Controllers/UsersController.cs

using CarbonTC.Auth.Application.Features.Users.Commands.ChangePassword;
using CarbonTC.Auth.Application.Features.Users.Commands.DeleteUser;
using CarbonTC.Auth.Application.Features.Users.Commands.UpdateProfile;
using CarbonTC.Auth.Application.Features.Users.Queries.GetAllUsers;
using CarbonTC.Auth.Application.Features.Users.Queries.GetCurrentUser;
using CarbonTC.Auth.Application.Features.Users.Queries.GetUserById;
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

    public UsersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    // GET: api/users/profile
    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var userId = GetCurrentUserId();
        var result = await _mediator.Send(new GetCurrentUserQuery(userId));
        return Ok(new { success = true, data = result });
    }

    // PUT: api/users/profile
    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileCommand command)
    {
        var userId = GetCurrentUserId();
        var updatedCommand = command with { UserId = userId };
        var result = await _mediator.Send(updatedCommand);
        return Ok(new { success = true, data = result });
    }

    // POST: api/users/change-password
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordCommand command)
    {
        var userId = GetCurrentUserId();
        var updatedCommand = command with { UserId = userId };
        var result = await _mediator.Send(updatedCommand);
        return Ok(new { success = true, message = "Password changed successfully. Please login again on all devices." });
    }

    // DELETE: api/users/profile
    [HttpDelete("profile")]
    public async Task<IActionResult> DeleteProfile()
    {
        var userId = GetCurrentUserId();
        var result = await _mediator.Send(new DeleteUserCommand(userId));
        return Ok(new { success = true, message = "Account deleted successfully" });
    }

    // GET: api/users/{id} (Admin only)
    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetUserById(Guid id)
    {
        var result = await _mediator.Send(new GetUserByIdQuery(id));
        return Ok(new { success = true, data = result });
    }

    // GET: api/users (Admin only)
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllUsers(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? searchTerm = null)
    {
        var result = await _mediator.Send(new GetAllUsersQuery(pageNumber, pageSize, searchTerm));
        return Ok(new { success = true, data = result });
    }

    // DELETE: api/users/{id} (Admin only)
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteUser(Guid id)
    {
        var result = await _mediator.Send(new DeleteUserCommand(id));
        return Ok(new { success = true, message = "User deleted successfully" });
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