using System;
using CarbonTC.CarbonLifecycle.Domain.Enums;

namespace CarbonTC.CarbonLifecycle.Domain.Entities
{
    public class EVJourney : BaseEntity
    {
        public Guid Id { get; set; }
        public Guid JourneyBatchId { get; private set; }
        public string UserId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public decimal DistanceKm { get; set; }
        public decimal CO2EstimateKg { get; private set; }
        public string VehicleType { get; set; }
        public string Origin { get; set; }
        public string Destination { get; set; }
        public JourneyStatus Status { get; private set; }

        // Navigation Property
        public JourneyBatch JourneyBatch { get; set; }

        // Private constructor cho EF Core
        private EVJourney()
        {
            UserId = string.Empty;
            VehicleType = string.Empty;
            Origin = string.Empty;
            Destination = string.Empty;
        }

        // Factory/Initialization Method
        public static EVJourney Create(
            Guid journeyBatchId,
            string userId,
            decimal distanceKm,
            DateTime startTime,
            DateTime endTime,
            string vehicleType,
            string origin,
            string destination,
            decimal co2EstimateKg)
        {
            if (journeyBatchId == Guid.Empty) throw new ArgumentException("JourneyBatchId cannot be empty.", nameof(journeyBatchId));
            if (string.IsNullOrWhiteSpace(userId)) throw new ArgumentException("User ID cannot be empty.", nameof(userId));
            if (distanceKm <= 0) throw new ArgumentException("Distance must be positive.", nameof(distanceKm));

            return new EVJourney
            {
                Id = Guid.NewGuid(),
                JourneyBatchId = journeyBatchId,
                UserId = userId,
                StartTime = startTime,
                EndTime = endTime,
                DistanceKm = distanceKm,
                CO2EstimateKg = co2EstimateKg,
                VehicleType = vehicleType,
                Origin = origin,
                Destination = destination,
                Status = JourneyStatus.Pending
            };
        }

        // Method để gán BatchId và chuyển trạng thái (dùng cho CreateJourneyBatchCommandHandler)
        public void AssignToBatch(Guid batchId)
        {
            if (Status != JourneyStatus.Pending)
            {
                throw new InvalidOperationException($"Cannot assign a journey to a batch in status {Status}.");
            }

            JourneyBatchId = batchId;
            Status = JourneyStatus.Completed;
            LastModifiedAt = DateTime.UtcNow;
        }

        // Method để cập nhật CO2 Estimate (dùng trong Domain Service Calculation)
        public void UpdateCO2Estimate(decimal co2EstimateKg)
        {
            if (co2EstimateKg < 0) throw new ArgumentException("CO2 estimate cannot be negative.", nameof(co2EstimateKg));
            CO2EstimateKg = co2EstimateKg;
            LastModifiedAt = DateTime.UtcNow;
        }

        // Method để đánh dấu đã xác minh
        public void MarkAsVerified()
        {
            if (Status != JourneyStatus.Completed && Status != JourneyStatus.Pending)
            {
                throw new InvalidOperationException($"Cannot mark journey as verified in status {Status}.");
            }
            Status = JourneyStatus.Verified;
            LastModifiedAt = DateTime.UtcNow;
        }
    }

    public enum JourneyStatus
    {
        Pending,
        Completed,
        Failed,
        Verified
    }
}