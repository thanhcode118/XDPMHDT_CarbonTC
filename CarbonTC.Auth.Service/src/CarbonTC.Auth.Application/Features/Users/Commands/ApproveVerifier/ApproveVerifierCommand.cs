// CarbonTC.Auth.Application/Features/Users/Commands/ApproveCVA/ApproveCVACommand.cs

using MediatR;

namespace CarbonTC.Auth.Application.Features.Users.Commands.ApproveCVA;

public record ApproveCVACommand(Guid UserId) : IRequest<bool>;