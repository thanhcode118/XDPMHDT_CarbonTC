using Domain.Common;

namespace Domain.Events.AuctionBid
{
    public record AuctionCompletedWithoutBidsDomainEvent(
        Guid ListingId
    ) : DomainEvent;
}
