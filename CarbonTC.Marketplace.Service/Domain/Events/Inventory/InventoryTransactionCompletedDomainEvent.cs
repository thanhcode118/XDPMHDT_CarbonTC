using Domain.Common;

namespace Domain.Events.Inventory
{
    public record InventoryTransactionCompletedDomainEvent(
        Guid CreditId,
        decimal Amount
    ) : DomainEvent;
}
