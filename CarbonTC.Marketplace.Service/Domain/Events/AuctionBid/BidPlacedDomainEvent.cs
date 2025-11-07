using Domain.Common;

namespace Domain.Events.AuctionBid
{
    public record BidPlacedDomainEvent(
        Guid ListingId,
        Guid BidderId,
        decimal BidAmount,
        DateTime BidTime,
        Guid? previousWinnerId
    ) : DomainEvent;
}
