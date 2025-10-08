using Domain.Common;

namespace Domain.Events.AuctionBid
{
    public record AuctionExtendedDomainEvent(
        Guid ListingId,
        DateTime NewEndTime
    ) : DomainEvent;
}
