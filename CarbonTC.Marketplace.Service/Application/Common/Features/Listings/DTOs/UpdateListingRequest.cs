using Domain.Enum;

namespace Application.Common.Features.Listings.DTOs
{
    public record UpdateListingRequest(
        ListingType Type,
        decimal PricePerUnit,
        ListingStatus Status,
        DateTime? ClosedAt,
        decimal? MinimumBid,
        DateTime? AuctionEndTime
    );
}
