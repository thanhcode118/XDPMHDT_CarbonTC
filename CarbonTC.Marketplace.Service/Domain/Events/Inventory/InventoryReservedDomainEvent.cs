using Domain.Common;

namespace Domain.Events.Inventory
{
    public record InventoryReservedDomainEvent(
        Guid CreditId,
        decimal Amount
    ) : DomainEvent;
}
