// CarbonTC.Auth.Application/Features/Users/Commands/UpdateProfile/UpdateProfileValidator.cs

using FluentValidation;

namespace CarbonTC.Auth.Application.Features.Users.Commands.UpdateProfile;

public class UpdateProfileValidator : AbstractValidator<UpdateProfileCommand>
{
    public UpdateProfileValidator()
    {
        RuleFor(x => x.FullName)
            .NotEmpty().WithMessage("Full name is required")
            .NotNull().WithMessage("Full name is required")
            .MinimumLength(2).WithMessage("Full name must be at least 2 characters")
            .MaximumLength(255).WithMessage("Full name cannot exceed 255 characters")
            .Matches(@"^[a-zA-Z\s\u00C0-\u1EF9]+$").WithMessage("Full name can only contain letters and spaces");

        RuleFor(x => x.PhoneNumber)
            .Must(BeValidPhoneNumber).WithMessage("Invalid phone number format. Must be 10-15 digits, optionally starting with +")
            .When(x => !string.IsNullOrEmpty(x.PhoneNumber));
    }

    private bool BeValidPhoneNumber(string? phoneNumber)
    {
        if (string.IsNullOrWhiteSpace(phoneNumber))
            return true; // Cho phép null/empty

        // Cho phép: +84912345678, 84912345678, 0912345678
        return System.Text.RegularExpressions.Regex.IsMatch(
            phoneNumber,
            @"^\+?[0-9]{10,15}$"
        );
    }
}