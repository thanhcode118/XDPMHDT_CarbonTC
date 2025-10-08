using Domain.Common;

namespace Domain.Events.Transactions
{
    public record TransactionCreatedDomainEvent(
        Guid TransactionId,
        Guid BuyerId,
        Guid SellerId,
        Guid ListingId,
        decimal Quantity,
        decimal TotalAmount
    ) : DomainEvent;
}
