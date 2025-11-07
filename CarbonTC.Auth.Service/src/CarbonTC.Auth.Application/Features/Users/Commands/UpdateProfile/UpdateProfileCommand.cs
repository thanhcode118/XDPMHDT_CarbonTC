// CarbonTC.Auth.Application/Features/Users/Commands/UpdateProfile/UpdateProfileCommand.cs

using CarbonTC.Auth.Application.DTOs;
using MediatR;

namespace CarbonTC.Auth.Application.Features.Users.Commands.UpdateProfile;

public record UpdateProfileCommand(
    Guid UserId,
    string FullName,
    string? PhoneNumber
) : IRequest<UserProfileDto>;