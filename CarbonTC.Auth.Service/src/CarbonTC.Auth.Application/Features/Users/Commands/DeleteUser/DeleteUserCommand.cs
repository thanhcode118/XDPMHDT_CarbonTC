// CarbonTC.Auth.Application/Features/Users/Commands/DeleteUser/DeleteUserCommand.cs

using MediatR;

namespace CarbonTC.Auth.Application.Features.Users.Commands.DeleteUser;

public record DeleteUserCommand(Guid UserId) : IRequest<bool>;