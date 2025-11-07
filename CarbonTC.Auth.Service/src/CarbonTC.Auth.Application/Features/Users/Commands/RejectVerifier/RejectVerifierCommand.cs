// CarbonTC.Auth.Application/Features/Users/Commands/RejectVerifier/RejectVerifierCommand.cs

using MediatR;

namespace CarbonTC.Auth.Application.Features.Users.Commands.RejectVerifier;

public record RejectVerifierCommand(Guid UserId, string? Reason) : IRequest<bool>;