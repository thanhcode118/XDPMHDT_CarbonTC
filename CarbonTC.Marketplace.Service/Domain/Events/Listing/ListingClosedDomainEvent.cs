using Domain.Common;

namespace Domain.Events.Listing
{
    public record ListingClosedDomainEvent(
        Guid ListingId
    ) : DomainEvent;

}
