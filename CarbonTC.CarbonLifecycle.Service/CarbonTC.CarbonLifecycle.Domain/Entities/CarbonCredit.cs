using System;
using CarbonTC.CarbonLifecycle.Domain.Enums;

namespace CarbonTC.CarbonLifecycle.Domain.Entities
{
    public class CarbonCredit : BaseEntity
    {
        public Guid Id { get; set; }
        public Guid JourneyBatchId { get; set; } 
        public string UserId { get; set; }
        public decimal AmountKgCO2e { get; set; }
        public DateTime IssueDate { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public CarbonCreditStatus Status { get; set; }
        public string TransactionHash { get; set; }

        public Guid? VerificationRequestId { get; set; } 

        public JourneyBatch JourneyBatch { get; set; }

        public VerificationRequest VerificationRequest { get; set; } 
    }
}