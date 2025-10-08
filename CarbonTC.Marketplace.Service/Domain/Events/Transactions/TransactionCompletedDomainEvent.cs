using Domain.Common;

namespace Domain.Events.Transactions
{
    public record TransactionCompletedDomainEvent(
        Guid TransactionId,
        Guid BuyerId,
        Guid SellerId,
        decimal Quantity,
        decimal TotalAmount
    ) : DomainEvent;
}
