using Domain.Common;

namespace Domain.Events.AuctionBid
{
    public record AuctionCompletedDomainEvent(
        Guid ListingId,
        Guid CreditId,
        Guid WinningBidderId,
        Guid OwnerId,
        Decimal Quantity,
        decimal WinningBidAmount
    ) : DomainEvent;
}
