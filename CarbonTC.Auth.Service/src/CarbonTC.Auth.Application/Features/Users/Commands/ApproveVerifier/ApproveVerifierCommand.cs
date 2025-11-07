// CarbonTC.Auth.Application/Features/Users/Commands/ApproveVerifier/ApproveVerifierCommand.cs

using MediatR;

namespace CarbonTC.Auth.Application.Features.Users.Commands.ApproveVerifier;

public record ApproveVerifierCommand(Guid UserId) : IRequest<bool>;