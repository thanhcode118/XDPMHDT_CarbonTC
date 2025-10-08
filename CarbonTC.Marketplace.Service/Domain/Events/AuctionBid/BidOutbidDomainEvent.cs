using Domain.Common;

namespace Domain.Events.AuctionBid
{
    public record BidOutbidDomainEvent(
        Guid BidId,
        Guid ListingId,
        Guid BidderId,
        decimal OldBidAmount,
        decimal NewHighestBid
    ) : DomainEvent;
}
