using System;
using System.Collections.Generic; 
using CarbonTC.CarbonLifecycle.Domain.Enums;

namespace CarbonTC.CarbonLifecycle.Domain.Entities
{
    public class VerificationRequest : BaseEntity
    {
        public Guid Id { get; set; }
        public Guid JourneyBatchId { get; set; }
        public string RequestorId { get; set; }
        public string VerifierId { get; set; }
        public DateTime RequestDate { get; set; }
        public DateTime? VerificationDate { get; set; }
        public VerificationRequestStatus Status { get; set; }
        public string Notes { get; set; }

        public Guid? CvaStandardId { get; set; } 

        public JourneyBatch JourneyBatch { get; set; }

        public CVAStandard CvaStandard { get; set; } 
        public ICollection<CarbonCredit> CarbonCredits { get; set; } 
    }
}