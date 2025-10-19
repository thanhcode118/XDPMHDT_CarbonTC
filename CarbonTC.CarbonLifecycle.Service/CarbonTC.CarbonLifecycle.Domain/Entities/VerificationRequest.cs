using System;
using CarbonTC.CarbonLifecycle.Domain.Enums;

namespace CarbonTC.CarbonLifecycle.Domain.Entities
{
    public class VerificationRequest : BaseEntity
    {
        public Guid Id { get; set; }
        public Guid JourneyBatchId { get; set; }
        public string RequestorId { get; set; } // User who initiated the request
        public string VerifierId { get; set; } // Optional: Who verified it
        public DateTime RequestDate { get; set; }
        public DateTime? VerificationDate { get; set; }
        public VerificationRequestStatus Status { get; set; } // E.g., Pending, Approved, Rejected
        public string Notes { get; set; }

        // Navigation Property
        public JourneyBatch JourneyBatch { get; set; }
    }
}