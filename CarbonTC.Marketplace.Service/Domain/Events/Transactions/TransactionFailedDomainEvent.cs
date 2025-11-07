using Domain.Common;

namespace Domain.Events.Transactions
{
    public record TransactionFailedDomainEvent(
        Guid TransactionId,
        Guid BuyerId,
        Guid ListingId,
        string Reason,
        decimal TotalAmount
    ) : DomainEvent;
}
