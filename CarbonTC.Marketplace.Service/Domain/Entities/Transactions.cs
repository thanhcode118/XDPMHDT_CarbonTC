using Domain.Enum;

namespace Domain.Entities
{
    public class Transactions
    {
        public Guid BuyerId { get; private set; }
        public Guid SellerId { get; private set; }
        public Guid ListingId { get; private set; }
        public decimal Quantity { get; private set; }
        public decimal TotalAmount { get; private set; }
        public TransactionStatus Status { get; private set; }
        public DateTime? CompletedAt { get; private set; }
        public string? FailureReason { get; private set; }
    }
}
