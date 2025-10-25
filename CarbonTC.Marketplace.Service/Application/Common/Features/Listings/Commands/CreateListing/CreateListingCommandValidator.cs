using Domain.Enum;
using FluentValidation;

namespace Application.Common.Features.Listings.Commands.CreateListing
{
    public class CreateListingCommandValidator : AbstractValidator<CreateListingCommand>
    {
        public CreateListingCommandValidator()
        {
            RuleFor(x => x.CreditId)
                .NotEmpty().WithMessage("CreditId is required.");

            RuleFor(x => x.Type)
                .IsInEnum().WithMessage("Invalid listing type.");

            RuleFor(x => x.PricePerUnit)
                .GreaterThan(0).WithMessage("PricePerUnit must be greater than zero.")
                .When(x => x.Type == ListingType.FixedPrice);

            RuleFor(x => x.Quantity)
                .GreaterThan(0).WithMessage("Quantity must be greater than zero.");

            When(x => x.Type == ListingType.Auction, () =>
            {
                RuleFor(x => x.MinimumBid)
                    .NotNull().WithMessage("MinimumBid is required for auction listings.")
                    .GreaterThan(0).WithMessage("MinimumBid must be greater than zero.");

                RuleFor(x => x.AuctionEndTime)
                    .NotNull().WithMessage("AuctionEndTime is required for auction listings.")
                    .GreaterThan(DateTime.UtcNow).WithMessage("AuctionEndTime must be in the future.")
                    .Must(BeReasonableAuctionDuration).WithMessage("Auction duration should be between 1 hour and 30 days.");
            });

            // Rules for FixedPrice type - ensure auction fields are null
            When(x => x.Type == ListingType.FixedPrice, () =>
            {
                RuleFor(x => x.MinimumBid)
                    .Null().WithMessage("MinimumBid must be null for fixed price listings.");

                RuleFor(x => x.AuctionEndTime)
                    .Null().WithMessage("AuctionEndTime must be null for fixed price listings.");
            });
        }

        private bool BeReasonableAuctionDuration(DateTime? auctionEndTime)
        {
            if (!auctionEndTime.HasValue) return false;

            var duration = auctionEndTime.Value - DateTime.UtcNow;
            return duration >= TimeSpan.FromHours(1) && duration <= TimeSpan.FromDays(30);
        }
    }
}