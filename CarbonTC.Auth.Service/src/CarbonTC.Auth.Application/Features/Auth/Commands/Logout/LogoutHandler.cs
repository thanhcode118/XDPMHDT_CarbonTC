// CarbonTC.Auth.Application/Features/Auth/Commands/Logout/LogoutHandler.cs
using CarbonTC.Auth.Application.Interfaces;
using MediatR;

namespace CarbonTC.Auth.Application.Features.Auth.Commands.Logout;

public class LogoutHandler : IRequestHandler<LogoutCommand, bool>
{
    private readonly ITokenService _tokenService;

    public LogoutHandler(ITokenService tokenService)
    {
        _tokenService = tokenService;
    }

    public async Task<bool> Handle(LogoutCommand request, CancellationToken cancellationToken)
    {
        await _tokenService.RevokeRefreshTokenAsync(request.RefreshToken);
        return true;
    }
}