// CarbonTC.Auth.Application/Features/Auth/Commands/RefreshToken/RefreshTokenValidator.cs

using FluentValidation;

namespace CarbonTC.Auth.Application.Features.Auth.Commands.RefreshToken;

public class RefreshTokenValidator : AbstractValidator<RefreshTokenCommand>
{
    public RefreshTokenValidator()
    {
        RuleFor(x => x.RefreshToken)
            .NotEmpty().WithMessage("Refresh token is required");
    }
}