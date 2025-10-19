using System;
using CarbonTC.CarbonLifecycle.Domain.Enums;

namespace CarbonTC.CarbonLifecycle.Domain.Entities
{
    public class CarbonCredit : BaseEntity
    {
        public Guid Id { get; set; }
        public Guid JourneyBatchId { get; set; }
        public string UserId { get; set; }
        public decimal AmountKgCO2e { get; set; } // Carbon credits in kg CO2 equivalent
        public DateTime IssueDate { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public CarbonCreditStatus Status { get; set; } // E.g., Pending, Issued, Retired, Transferred
        public string TransactionHash { get; set; } // If tokenized on a blockchain

        // Navigation Property
        public JourneyBatch JourneyBatch { get; set; }
    }
}