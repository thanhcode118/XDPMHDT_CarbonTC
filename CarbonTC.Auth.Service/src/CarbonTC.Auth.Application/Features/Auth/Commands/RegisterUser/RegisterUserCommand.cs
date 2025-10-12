// CarbonTC.Auth.Application/Features/Auth/Commands/RegisterUser/RegisterUserCommand.cs
using CarbonTC.Auth.Application.DTOs;
using MediatR;

namespace CarbonTC.Auth.Application.Features.Auth.Commands.RegisterUser;

public record RegisterUserCommand(
    string Email,
    string Password,
    string FullName,
    string? PhoneNumber
) : IRequest<AuthResultDto>;