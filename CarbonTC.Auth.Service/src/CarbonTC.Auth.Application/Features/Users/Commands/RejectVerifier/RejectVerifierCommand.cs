// CarbonTC.Auth.Application/Features/Users/Commands/RejectCVA/RejectCVACommand.cs

using MediatR;

namespace CarbonTC.Auth.Application.Features.Users.Commands.RejectCVA;

public record RejectCVACommand(Guid UserId, string? Reason) : IRequest<bool>;