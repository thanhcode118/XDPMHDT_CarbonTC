// CarbonTC.Auth.Application/Features/Users/Commands/ChangePassword/ChangePasswordValidator.cs

using FluentValidation;

namespace CarbonTC.Auth.Application.Features.Users.Commands.ChangePassword;

public class ChangePasswordValidator : AbstractValidator<ChangePasswordCommand>
{
    public ChangePasswordValidator()
    {
        RuleFor(x => x.CurrentPassword)
            .NotEmpty().WithMessage("Current password is required");

        RuleFor(x => x.NewPassword)
            .NotEmpty().WithMessage("New password is required")
            .MinimumLength(6).WithMessage("New password must be at least 6 characters")
            .NotEqual(x => x.CurrentPassword).WithMessage("New password must be different from current password");
    }
}