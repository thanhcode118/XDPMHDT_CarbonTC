using System;
using System.Collections.Generic;
using CarbonTC.CarbonLifecycle.Domain.Enums;

namespace CarbonTC.CarbonLifecycle.Domain.Entities
{
    public class JourneyBatch : BaseEntity
    {
        public Guid Id { get; set; }
        public string UserId { get; set; }
        public DateTime CreationTime { get; set; }
        public DateTime? VerificationTime { get; set; }
        public JourneyBatchStatus Status { get; set; }
        public decimal TotalDistanceKm { get; set; } // Thay đổi từ double sang decimal
        public decimal TotalCO2SavedKg { get; set; } // Thay đổi từ double sang decimal
        public int NumberOfJourneys { get; set; }

        // Navigation Property
        public ICollection<EVJourney> EVJourneys { get; set; }
        public ICollection<CarbonCredit> CarbonCredits { get; set; }
        public ICollection<VerificationRequest> VerificationRequests { get; set; }
    }
}