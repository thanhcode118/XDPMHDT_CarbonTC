using Domain.Common;

namespace Domain.Events.Transactions
{
    public record TransactionDisputedDomainEvent(
        Guid TransactionId,
        string Reason
    ) : DomainEvent;
}
