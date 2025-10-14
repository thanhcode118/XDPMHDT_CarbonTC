using FluentValidation;

namespace Application.Common.Features.Listings.Commands.BuyNow
{
    public class BuyNowCommandValidator: AbstractValidator<BuyNowCommand>
    {
        public BuyNowCommandValidator()
        {
            RuleFor(x => x.CreditId).NotEmpty().WithMessage("CreditId is required.");
            RuleFor(x => x.ListingId).NotEmpty().WithMessage("ListingId is required.");
            RuleFor(x => x.BuyerId).NotEmpty().WithMessage("BuyerId is required.");
            RuleFor(x => x.Amount).GreaterThan(0).WithMessage("Amount must be greater than zero.");
        }
    }
}
