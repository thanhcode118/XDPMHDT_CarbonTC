using Domain.Common;

namespace Domain.Events.Inventory
{
    public record InventoryIncreasedDomainEvent(
        Guid CreditId,
        decimal Amount
    ) : DomainEvent;
}
