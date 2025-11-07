// CarbonTC.Auth.Application/Features/Users/Commands/ChangePassword/ChangePasswordCommand.cs

using MediatR;

namespace CarbonTC.Auth.Application.Features.Users.Commands.ChangePassword;

public record ChangePasswordCommand(
    Guid UserId,
    string CurrentPassword,
    string NewPassword
) : IRequest<bool>;