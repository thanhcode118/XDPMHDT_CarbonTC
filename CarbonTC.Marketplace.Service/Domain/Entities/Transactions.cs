using Domain.Common;
using Domain.Enum;
using Domain.Events.Listing;
using Domain.Events.Transactions;
using Domain.Exceptions;

namespace Domain.Entities
{
    public class Transactions: BaseEntity, AggregateRoot
    {
        public Guid BuyerId { get; private set; }
        public Guid SellerId { get; private set; }
        public Guid ListingId { get; private set; }
        public decimal Quantity { get; private set; }
        public decimal TotalAmount { get; private set; }
        public TransactionStatus Status { get; private set; }
        public DateTime? CompletedAt { get; private set; }
        public string? FailureReason { get; private set; }


        private const decimal PLATFORM_FEE_PERCENTAGE = 0.02m;

        private Transactions() {}

        private Transactions(
            Guid buyerId,
            Guid sellerId,
            Guid listingId,
            decimal quantity,
            decimal totalAmount)
        {
            Id = Guid.NewGuid();
            BuyerId = buyerId;
            SellerId = sellerId;
            ListingId = listingId;
            Quantity = quantity;
            TotalAmount = totalAmount;
            Status = TransactionStatus.Pending;
            CreatedAt = DateTime.UtcNow;
        }

        public static Transactions Create(
            Guid buyerId,
            Guid sellerId,
            Guid listingId,
            decimal quantity,
            decimal pricePerUnit)
        {
            if (quantity <= 0)
                throw new DomainException("Quantity must be greater than zero");

            if (pricePerUnit <= 0)
                throw new DomainException("Price per unit must be greater than zero");

            var totalAmount = quantity * pricePerUnit;

            var transaction = new Transactions(buyerId, sellerId, listingId, quantity, totalAmount);

            transaction.AddDomainEvent(new TransactionCreatedDomainEvent(
                transaction.Id,
                buyerId,
                sellerId,
                totalAmount,
                quantity,
                transaction.PlatformFee,
                transaction.CreatedAt
                ));
            transaction.AddDomainEvent(new BalanceDeductedDomainEvent(buyerId, totalAmount));

            return transaction;
        }
        public void MarkAsSuccess()
        {
            if (Status != TransactionStatus.Pending)
                throw new DomainException("Only pending transactions can be marked as success");

            Status = TransactionStatus.Success;
            CompletedAt = DateTime.UtcNow;

            AddDomainEvent(new TransactionCompletedDomainEvent(Id, BuyerId, SellerId, Quantity, TotalAmount));
        }

        public void MarkAsFailed(string reason)
        {
            if (Status != TransactionStatus.Pending)
                throw new DomainException("Only pending transactions can be marked as failed");

            Status = TransactionStatus.Failed;
            FailureReason = reason;
            CompletedAt = DateTime.UtcNow;

            AddDomainEvent(new TransactionFailedDomainEvent(Id, BuyerId, ListingId, reason, TotalAmount));
        }

        public void Refund(string reason)
        {
            if (Status != TransactionStatus.Success)
                throw new DomainException("Only successful transactions can be refunded");

            Status = TransactionStatus.Refunded;
            FailureReason = reason;

            AddDomainEvent(new TransactionRefundedDomainEvent(Id, BuyerId, SellerId, TotalAmount, reason));
        }


        public void MarkAsDisputed(string reason)
        {
            if (Status == TransactionStatus.Failed || Status == TransactionStatus.Refunded)
                throw new DomainException("Cannot dispute failed or refunded transactions");

            Status = TransactionStatus.Disputed;
            FailureReason = reason;

            AddDomainEvent(new TransactionDisputedDomainEvent(Id, reason));
        }

        public decimal PlatformFee => CalculatePlatformFee();
        private decimal CalculatePlatformFee()
        {
            return TotalAmount * PLATFORM_FEE_PERCENTAGE;
        }
    }
}
