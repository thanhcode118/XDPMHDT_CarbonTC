using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using CarbonTC.CarbonLifecycle.Service.Models.Enums; // Sẽ tạo sau

namespace CarbonTC.CarbonLifecycle.Service.Models.Entities
{
    public class JourneyBatch
    {
        [Key]
        public Guid BatchId { get; set; } // PK

        [Required]
        public Guid OwnerId { get; set; } // FK to User Service's UserId

        public double TotalDistanceKm { get; set; } // Tổng quãng đường
        public double TotalCO2SavedKg { get; set; } // Tổng CO2 tiết kiệm
        public int CalculatedCredits { get; set; } // Số tín chỉ ước tính ban đầu

        [Required]
        public JourneyBatchStatus Status { get; set; } // PendingCalculation, PendingVerification, Verified, Rejected

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public ICollection<EVJourney>? Journeys { get; set; }
        public ICollection<VerificationRequest>? VerificationRequests { get; set; }
    }
}