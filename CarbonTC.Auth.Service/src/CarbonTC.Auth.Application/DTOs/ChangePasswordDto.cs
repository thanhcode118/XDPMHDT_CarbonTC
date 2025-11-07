// CarbonTC.Auth.Application/DTOs/ChangePasswordDto.cs

namespace CarbonTC.Auth.Application.DTOs;

public record ChangePasswordDto(
    string CurrentPassword,
    string NewPassword
);