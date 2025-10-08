using Domain.Common;

namespace Domain.Events.Inventory
{
    public record InventoryTransactionRolledBackDomainEvent(
        Guid CreditId,
        decimal Amount
    ) : DomainEvent;
}
