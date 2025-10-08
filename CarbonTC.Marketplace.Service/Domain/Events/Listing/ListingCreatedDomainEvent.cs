using Domain.Common;
using Domain.Enum;

namespace Domain.Events.Listing
{
    public record ListingCreatedDomainEvent(
        Guid ListingId,
        Guid CreditId,
        Guid OwnerId,
        ListingType Type,
        decimal PricePerUnit
    ) : DomainEvent;
}
