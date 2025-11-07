using Domain.Common;

namespace Domain.Events.Transactions
{
    public record TransactionCreatedDomainEvent(
        Guid TransactionId,
        Guid BuyerUserId,
        Guid SellerUserId,
        decimal MoneyAmount,
        decimal CreditAmount,
        decimal PlatformFee,
        DateTime CreatedAt
    ) : DomainEvent;
}
