using Domain.Common.Response;
using Domain.Enum;
using MediatR;

namespace Application.Common.Features.Listings.Commands.CreateListing
{
    public record CreateListingCommand: IRequest<Result<Guid>>
    {
        public Guid CreditId { get; init; }
        public ListingType Type { get; init; }
        public decimal PricePerUnit { get; init; }
        public decimal Quantity { get; init; }
        public decimal? MinimumBid { get; init; }
        public DateTime? AuctionEndTime { get; init; }
    }
}
