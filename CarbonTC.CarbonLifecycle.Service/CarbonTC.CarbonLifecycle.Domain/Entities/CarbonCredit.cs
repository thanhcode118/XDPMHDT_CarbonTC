using System;
using CarbonTC.CarbonLifecycle.Domain.Enums;

namespace CarbonTC.CarbonLifecycle.Domain.Entities
{
    public class CarbonCredit : BaseEntity
    {
        public Guid Id { get; private set; }
        public Guid JourneyBatchId { get; private set; }
        public string UserId { get; private set; }
        public decimal AmountKgCO2e { get; private set; }
        public DateTime IssueDate { get; private set; }
        public DateTime? ExpiryDate { get; private set; }
        public CarbonCreditStatus Status { get; private set; }
        public string TransactionHash { get; private set; }

        public Guid? VerificationRequestId { get; private set; }

        // Navigation properties giữ public set cho EF Core
        public JourneyBatch JourneyBatch { get; set; }

        public VerificationRequest VerificationRequest { get; set; }

        // Private constructor cho 
        private CarbonCredit()
        {
            UserId = string.Empty;
            TransactionHash = string.Empty;
        }

        // Factory Method
        public static CarbonCredit Issue(
            Guid journeyBatchId,
            string userId,
            decimal amountKgCO2e,
            Guid? verificationRequestId,
            string transactionHash = "pending_wallet_tx",
            DateTime? expiryDate = null)
        {
            if (journeyBatchId == Guid.Empty) throw new ArgumentException("JourneyBatchId cannot be empty.", nameof(journeyBatchId));
            if (string.IsNullOrWhiteSpace(userId)) throw new ArgumentException("User ID cannot be empty.", nameof(userId));
            if (amountKgCO2e <= 0) throw new ArgumentException("AmountKgCO2e must be positive.", nameof(amountKgCO2e));

            return new CarbonCredit
            {
                Id = Guid.NewGuid(),
                JourneyBatchId = journeyBatchId,
                UserId = userId,
                AmountKgCO2e = amountKgCO2e,
                IssueDate = DateTime.UtcNow,
                ExpiryDate = expiryDate,
                Status = CarbonCreditStatus.Issued,
                TransactionHash = transactionHash,
                VerificationRequestId = verificationRequestId
            };
        }

        // Behavior Method 
        public void MarkAsRetired()
        {
            if (Status != CarbonCreditStatus.Issued)
            {
                throw new InvalidOperationException($"Cannot retire a credit in status {Status}.");
            }
            Status = CarbonCreditStatus.Retired;
            LastModifiedAt = DateTime.UtcNow;
        }

        public void UpdateTransactionHash(string hash)
        {
            if (string.IsNullOrWhiteSpace(hash))
            {
                throw new ArgumentException("Transaction hash cannot be empty.", nameof(hash));
            }
            if (TransactionHash != "pending_wallet_tx")
            {
                throw new InvalidOperationException("Transaction hash has already been set.");
            }

            TransactionHash = hash;
            LastModifiedAt = DateTime.UtcNow;
        }
    }
}