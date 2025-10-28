using Application.Common.Features.Listings.Commands.UpdateListing;
using Domain.Enum;
using FluentValidation;

public class UpdateListingCommandValidator : AbstractValidator<UpdateListingCommand>
{
    public UpdateListingCommandValidator()
    {
        RuleFor(x => x.Status)
            .IsInEnum().WithMessage("INVALID_LISTING_STATUS");

        // Fixed Price rules
        When(x => x.Type == ListingType.FixedPrice, () =>
        {
            RuleFor(x => x.PricePerUnit)
                .NotNull().WithMessage("PRICE_PER_UNIT_REQUIRED_FOR_FIXED_PRICE")
                .GreaterThan(0).WithMessage("PRICE_MUST_BE_POSITIVE")
                .When(x => x.Status == ListingStatus.Open);

            RuleFor(x => x.MinimumBid)
                .Null().WithMessage("MINIMUM_BID_MUST_BE_NULL_FOR_FIXED_PRICE");

            RuleFor(x => x.AuctionEndTime)
                .Null().WithMessage("AUCTION_END_TIME_MUST_BE_NULL_FOR_FIXED_PRICE");
        });

        When(x => x.Type == ListingType.Auction, () =>
        {
            RuleFor(x => x.PricePerUnit)
                .GreaterThan(0).WithMessage("PRICE_MUST_BE_POSITIVE")
                .When(x => x.PricePerUnit.HasValue && x.Status == ListingStatus.Open);

            RuleFor(x => x.MinimumBid)
                .NotNull().WithMessage("MINIMUM_BID_REQUIRED_FOR_AUCTION")
                .GreaterThan(0).WithMessage("MINIMUM_BID_MUST_BE_POSITIVE")
                .When(x => x.Status == ListingStatus.Open);

            RuleFor(x => x.AuctionEndTime)
                .NotNull().WithMessage("AUCTION_END_TIME_REQUIRED_FOR_AUCTION")
                .GreaterThan(DateTime.UtcNow).WithMessage("AUCTION_END_TIME_MUST_BE_IN_FUTURE")
                .Must(BeReasonableAuctionDuration).WithMessage("AUCTION_DURATION_INVALID")
                .When(x => x.Status == ListingStatus.Open);
        });

        When(x => x.Status == ListingStatus.Closed || x.Status == ListingStatus.Sold, () =>
        {
            RuleFor(x => x.ClosedAt)
                .NotNull().WithMessage("CLOSED_AT_REQUIRED_FOR_CLOSED_STATUS")
                .LessThanOrEqualTo(DateTime.UtcNow).WithMessage("CLOSED_AT_CANNOT_BE_IN_FUTURE");
        });

        When(x => x.Status == ListingStatus.Open, () =>
        {
            RuleFor(x => x.ClosedAt)
                .Null().WithMessage("CLOSED_AT_MUST_BE_NULL_FOR_OPEN_STATUS");
        });

        // Business logic validations
        RuleFor(x => x)
            .Must(HaveValidAuctionFieldsWhenOpen).WithMessage("INVALID_AUCTION_FIELDS_FOR_OPEN_STATUS")
            .When(x => x.Type == ListingType.Auction && x.Status == ListingStatus.Open);

        RuleFor(x => x)
            .Must(HaveValidFixedPriceFieldsWhenOpen).WithMessage("INVALID_FIXED_PRICE_FIELDS_FOR_OPEN_STATUS")
            .When(x => x.Type == ListingType.FixedPrice && x.Status == ListingStatus.Open);
    }

    private bool BeReasonableAuctionDuration(DateTime? auctionEndTime)
    {
        if (!auctionEndTime.HasValue) return false;

        var duration = auctionEndTime.Value - DateTime.UtcNow;
        return duration >= TimeSpan.FromHours(1) && duration <= TimeSpan.FromDays(30);
    }

    private bool HaveValidAuctionFieldsWhenOpen(UpdateListingCommand command)
    {
        var priceValid = !command.PricePerUnit.HasValue || command.PricePerUnit.Value > 0;

        return priceValid &&
               command.MinimumBid.HasValue &&
               command.AuctionEndTime.HasValue &&
               command.AuctionEndTime.Value > DateTime.UtcNow;
    }

    private bool HaveValidFixedPriceFieldsWhenOpen(UpdateListingCommand command)
    {
        return command.PricePerUnit.HasValue &&
               command.PricePerUnit.Value > 0 &&
               !command.MinimumBid.HasValue &&
               !command.AuctionEndTime.HasValue;
    }
}