// CarbonTC.Auth.Application/DTOs/UserDto.cs
namespace CarbonTC.Auth.Application.DTOs;

public record UserDto(
    Guid Id,
    string Email,
    string FullName,
    string? PhoneNumber,
    string Status,
    string? RoleName
);