// CarbonTC.Auth.Application/Features/Auth/Commands/LoginUser/LoginUserCommand.cs
using CarbonTC.Auth.Application.DTOs;
using MediatR;

namespace CarbonTC.Auth.Application.Features.Auth.Commands.LoginUser;

public record LoginUserCommand(
    string Email,
    string Password
) : IRequest<AuthResultDto>;