using Domain.Common;

namespace Domain.Events.Listing
{
    public record ListingPurchasedDomainEvent(
        Guid ListingId, 
        Guid BuyerId, 
        Guid OwerId,
        decimal Amount,
        decimal TotalPrice) : DomainEvent;
}
