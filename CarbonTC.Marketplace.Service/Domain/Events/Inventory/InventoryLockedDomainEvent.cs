using Domain.Common;

namespace Domain.Events.Inventory
{
    public record InventoryLockedDomainEvent(
        Guid CreditId,
        decimal Amount
    ) : DomainEvent;
}
