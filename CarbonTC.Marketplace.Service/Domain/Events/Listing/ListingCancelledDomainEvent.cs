using Domain.Common;

namespace Domain.Events.Listing
{
    public record ListingCancelledDomainEvent(
        Guid ListingId,
        Guid OwnerId,
        Guid CreditId
    ) : DomainEvent;
}
