// CarbonTC.Auth.Application/DTOs/UserProfileDto.cs

namespace CarbonTC.Auth.Application.DTOs;

public record UserProfileDto(
    Guid Id,
    string Email,
    string FullName,
    string? PhoneNumber,
    string Status,
    string? RoleName,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);