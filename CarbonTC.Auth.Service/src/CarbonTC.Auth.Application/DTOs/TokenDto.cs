// CarbonTC.Auth.Application/DTOs/TokenDto.cs
namespace CarbonTC.Auth.Application.DTOs;

public record TokenDto(
    string AccessToken,
    string RefreshToken
);