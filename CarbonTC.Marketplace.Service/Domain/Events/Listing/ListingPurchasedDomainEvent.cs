using Domain.Common;

namespace Domain.Events.Listing
{
    public record ListingPurchasedDomainEvent(
        Guid ListingId, 
        Guid CreditId,
        Guid BuyerId, 
        Guid OwerId,
        decimal Amount,
        decimal TotalPrice) : DomainEvent;
}
