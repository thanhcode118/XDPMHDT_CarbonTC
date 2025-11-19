using Domain.Enum;

namespace Application.Common.Features.Transactions.DTOs
{
    public class TransactionDto
    {
        public Guid Id { get; init; }
        public Guid BuyerId { get; init; }
        public Guid SellerId { get; init; }
        public Guid ListingId { get; init; }
        public decimal Quantity { get; init; }
        public decimal TotalAmount { get; init; }
        public TransactionStatus Status { get; init; }
        public DateTime? CompletedAt { get; init; }
        public string? FailureReason { get; init; }
        public DateTime CreatedAt { get; init; }
    }
}
