// CarbonTC.Auth.Application/DTOs/UpdateProfileDto.cs

namespace CarbonTC.Auth.Application.DTOs;

public record UpdateProfileDto(
    string FullName,
    string? PhoneNumber
);