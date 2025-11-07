// CarbonTC.Auth.Application/Features/Auth/Commands/Logout/LogoutCommand.cs
using MediatR;

namespace CarbonTC.Auth.Application.Features.Auth.Commands.Logout;

public record LogoutCommand(string RefreshToken) : IRequest<bool>;