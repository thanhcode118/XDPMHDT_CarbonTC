using Domain.Common;

namespace Domain.Events.Transactions
{
    public record TransactionRefundedDomainEvent(
        Guid TransactionId,
        Guid BuyerId,
        Guid SellerId,
        decimal RefundAmount,
        string Reason
    ) : DomainEvent;
}
