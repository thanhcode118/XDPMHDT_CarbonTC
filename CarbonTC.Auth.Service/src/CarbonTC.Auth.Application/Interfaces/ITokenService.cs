// CarbonTC.Auth.Application/Interfaces/ITokenService.cs
using CarbonTC.Auth.Domain.Entities;

namespace CarbonTC.Auth.Application.Interfaces;

public interface ITokenService
{
    string GenerateAccessToken(User user);
    string GenerateRefreshToken();
    Task<RefreshToken> SaveRefreshTokenAsync(Guid userId, string token);
    Task<RefreshToken?> GetRefreshTokenAsync(string token);
    Task RevokeRefreshTokenAsync(string token);
}