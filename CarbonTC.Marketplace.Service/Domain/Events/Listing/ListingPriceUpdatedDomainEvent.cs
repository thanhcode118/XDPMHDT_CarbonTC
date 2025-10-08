using Domain.Common;

namespace Domain.Events.Listing
{
    public record ListingPriceUpdatedDomainEvent(
        Guid ListingId,
        decimal NewPrice
    ) : DomainEvent;

}
