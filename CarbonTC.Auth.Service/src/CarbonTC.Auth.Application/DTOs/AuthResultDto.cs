// CarbonTC.Auth.Application/DTOs/AuthResultDto.cs
namespace CarbonTC.Auth.Application.DTOs;

public record AuthResultDto(
    string AccessToken,
    string RefreshToken,
    UserDto User
);