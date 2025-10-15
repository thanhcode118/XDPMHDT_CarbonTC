using System;
using CarbonTC.CarbonLifecycle.Domain.Enums;

namespace CarbonTC.CarbonLifecycle.Domain.Entities
{
    public class EVJourney : BaseEntity
    {
        public Guid Id { get; set; }
        public Guid JourneyBatchId { get; set; }
        public string UserId { get; set; } // Người dùng sở hữu hành trình
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public decimal DistanceKm { get; set; } // Thay đổi từ double sang decimal
        public decimal CO2EstimateKg { get; set; } // Thay đổi từ double sang decimal
        public string VehicleType { get; set; } // E.g., Tesla Model 3, Nissan Leaf
        public string Origin { get; set; }
        public string Destination { get; set; }
        public JourneyStatus Status { get; set; }

        // Navigation Property
        public JourneyBatch JourneyBatch { get; set; }
    }

    public enum JourneyStatus
    {
        Pending,
        Completed,
        Failed,
        Verified
    }
}