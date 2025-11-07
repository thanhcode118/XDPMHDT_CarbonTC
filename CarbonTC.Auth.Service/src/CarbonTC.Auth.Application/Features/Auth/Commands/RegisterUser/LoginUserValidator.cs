// CarbonTC.Auth.Application/Features/Auth/Commands/LoginUser/LoginUserValidator.cs
using FluentValidation;

namespace CarbonTC.Auth.Application.Features.Auth.Commands.LoginUser;

public class LoginUserValidator : AbstractValidator<LoginUserCommand>
{
    public LoginUserValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required")
            .EmailAddress().WithMessage("Invalid email format");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required");
    }
}