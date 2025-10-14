// CarbonTC.Auth.Application/Features/Auth/Commands/RefreshToken/RefreshTokenHandler.cs

using CarbonTC.Auth.Application.DTOs;
using CarbonTC.Auth.Application.Interfaces;
using MediatR;

namespace CarbonTC.Auth.Application.Features.Auth.Commands.RefreshToken;

public class RefreshTokenHandler : IRequestHandler<RefreshTokenCommand, TokenDto>
{
    private readonly ITokenService _tokenService;

    public RefreshTokenHandler(ITokenService tokenService)
    {
        _tokenService = tokenService;
    }

    public async Task<TokenDto> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        // 1. Validate refresh token
        var storedToken = await _tokenService.GetRefreshTokenAsync(request.RefreshToken);

        if (storedToken == null)
        {
            throw new UnauthorizedAccessException("Invalid refresh token");
        }

        if (storedToken.IsRevoked)
        {
            throw new UnauthorizedAccessException("Refresh token has been revoked");
        }

        if (storedToken.ExpiresAt < DateTime.UtcNow)
        {
            throw new UnauthorizedAccessException("Refresh token has expired");
        }

        // 2. Generate new tokens
        var newAccessToken = _tokenService.GenerateAccessToken(storedToken.User);
        var newRefreshToken = _tokenService.GenerateRefreshToken();

        // 3. Revoke old refresh token
        await _tokenService.RevokeRefreshTokenAsync(request.RefreshToken);

        // 4. Save new refresh token
        await _tokenService.SaveRefreshTokenAsync(storedToken.UserId, newRefreshToken);

        // 5. Return new tokens
        return new TokenDto(newAccessToken, newRefreshToken);
    }
}