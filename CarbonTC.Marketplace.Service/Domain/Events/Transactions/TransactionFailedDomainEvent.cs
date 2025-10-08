using Domain.Common;

namespace Domain.Events.Transactions
{
    public record TransactionFailedDomainEvent(
        Guid TransactionId,
        string Reason
    ) : DomainEvent;
}
