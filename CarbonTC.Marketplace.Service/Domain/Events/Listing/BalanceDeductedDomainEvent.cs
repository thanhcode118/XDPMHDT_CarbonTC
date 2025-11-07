using Domain.Common;

namespace Domain.Events.Listing
{
    public record BalanceDeductedDomainEvent(
        Guid BuyerId,
        decimal TotalPrice
    ) : DomainEvent;
}
