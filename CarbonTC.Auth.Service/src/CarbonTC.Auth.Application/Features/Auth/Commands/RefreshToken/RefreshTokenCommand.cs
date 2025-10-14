// CarbonTC.Auth.Application/Features/Auth/Commands/RefreshToken/RefreshTokenCommand.cs

using CarbonTC.Auth.Application.DTOs;
using MediatR;

namespace CarbonTC.Auth.Application.Features.Auth.Commands.RefreshToken;

public record RefreshTokenCommand(string RefreshToken) : IRequest<TokenDto>;