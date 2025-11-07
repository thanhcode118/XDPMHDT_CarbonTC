using Domain.Common;

namespace Domain.Events.Inventory
{
    public record InventoryReleasedDomainEvent(
        Guid CreditId,
        decimal Amount
    ) : DomainEvent;
}
