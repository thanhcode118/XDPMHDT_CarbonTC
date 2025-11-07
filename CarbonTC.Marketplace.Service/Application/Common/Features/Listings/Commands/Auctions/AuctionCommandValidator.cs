using FluentValidation;

namespace Application.Common.Features.Listings.Commands.Auctions
{
    public class AuctionCommandValidator: AbstractValidator<AuctionCommand>
    {
        public AuctionCommandValidator()
        {
            RuleFor(x => x.ListingId)
                .NotEmpty().WithMessage("ListingId is required.");
            RuleFor(x => x.BidAmount)
                .GreaterThan(0).WithMessage("BidAmount must be greater than zero.");
        }
    }
}
