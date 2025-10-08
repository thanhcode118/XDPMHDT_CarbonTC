using Domain.Common;

namespace Domain.Events.AuctionBid
{
    public record AuctionCompletedDomainEvent(
        Guid ListingId,
        Guid WinningBidderId,
        decimal WinningBidAmount
    ) : DomainEvent;
}
