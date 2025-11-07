// CarbonTC.Auth.Application/Features/Auth/Commands/RegisterUser/RegisterUserValidator.cs

using FluentValidation;

namespace CarbonTC.Auth.Application.Features.Auth.Commands.RegisterUser;

public class RegisterUserValidator : AbstractValidator<RegisterUserCommand>
{
    private readonly string[] _validRoles = { "EVOwner", "CreditBuyer", "Verifier", "Admin" };

    public RegisterUserValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required")
            .EmailAddress().WithMessage("Invalid email format");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required")
            .MinimumLength(6).WithMessage("Password must be at least 6 characters");

        RuleFor(x => x.FullName)
            .NotEmpty().WithMessage("Full name is required")
            .MaximumLength(255).WithMessage("Full name cannot exceed 255 characters");

        RuleFor(x => x.PhoneNumber)
            .Matches(@"^\+?[0-9]{10,15}$").When(x => !string.IsNullOrEmpty(x.PhoneNumber))
            .WithMessage("Invalid phone number format");

        RuleFor(x => x.RoleType)
            .Must(role => _validRoles.Contains(role))
            .WithMessage($"Role must be one of: {string.Join(", ", _validRoles)}");
    }
}