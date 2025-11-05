using System;
using System.Collections.Generic;
using CarbonTC.CarbonLifecycle.Domain.Enums;
using System.Linq;

namespace CarbonTC.CarbonLifecycle.Domain.Entities
{
    public class JourneyBatch : BaseEntity
    {
        public Guid Id { get; private set; }
        public string UserId { get; private set; }
        public DateTime CreationTime { get; private set; }
        public DateTime? VerificationTime { get; private set; }
        public JourneyBatchStatus Status { get; private set; }
        public decimal TotalDistanceKm { get; private set; }
        public decimal TotalCO2SavedKg { get; private set; }
        public int NumberOfJourneys { get; private set; }

        // Navigation Property
        public ICollection<EVJourney> EVJourneys { get; set; } = new List<EVJourney>();
        public ICollection<CarbonCredit> CarbonCredits { get; set; }
        public ICollection<VerificationRequest> VerificationRequests { get; set; }

        // Private constructor cho EF Core và Serialization
        private JourneyBatch()
        {
            UserId = string.Empty;
            CarbonCredits = new List<CarbonCredit>();
            VerificationRequests = new List<VerificationRequest>();
        }

        // Factory Method 1: Tạo Batch rỗng
        public static JourneyBatch Create(string userId)
        {
            if (string.IsNullOrWhiteSpace(userId))
            {
                throw new ArgumentException("User ID cannot be null or empty.", nameof(userId));
            }

            return new JourneyBatch
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                CreationTime = DateTime.UtcNow,
                Status = JourneyBatchStatus.Pending,
                TotalDistanceKm = 0,
                TotalCO2SavedKg = 0,
                NumberOfJourneys = 0,
            };
        }

        // Factory Method 2: Tạo Batch từ danh sách Journeys (dùng cho CreateJourneyBatchCommandHandler)
        public static JourneyBatch CreateFromJourneys(string userId, ICollection<EVJourney> journeys)
        {
            if (string.IsNullOrWhiteSpace(userId))
            {
                throw new ArgumentException("User ID cannot be null or empty.", nameof(userId));
            }
            if (journeys == null || !journeys.Any())
            {
                throw new ArgumentException("Batch must contain at least one journey.", nameof(journeys));
            }

            return new JourneyBatch
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                CreationTime = DateTime.UtcNow,
                Status = JourneyBatchStatus.Pending,
                EVJourneys = journeys,
                TotalDistanceKm = journeys.Sum(j => j.DistanceKm),
                TotalCO2SavedKg = journeys.Sum(j => j.CO2EstimateKg),
                NumberOfJourneys = journeys.Count,
            };
        }


        // Behavior Method 1: Thêm tóm tắt hành trình
        public void AddJourneySummary(decimal distanceKm, decimal co2SavedKg)
        {
            if (Status != JourneyBatchStatus.Pending)
            {
                throw new InvalidOperationException($"Cannot add journey summary to a batch that is not {JourneyBatchStatus.Pending}. Current status: {Status}.");
            }

            if (distanceKm <= 0 || co2SavedKg <= 0)
            {
                throw new ArgumentException("Distance and CO2 saved must be positive.");
            }

            TotalDistanceKm += distanceKm;
            TotalCO2SavedKg += co2SavedKg;
            NumberOfJourneys += 1;
            LastModifiedAt = DateTime.UtcNow;
        }

        // Behavior Method 2: Đánh dấu đã gửi xác minh
        public void MarkAsSubmitted()
        {
            if (Status != JourneyBatchStatus.Pending && Status != JourneyBatchStatus.Rejected)
            {
                throw new InvalidOperationException($"Cannot submit a batch in status {Status} for verification.");
            }

            if (NumberOfJourneys == 0)
            {
                throw new InvalidOperationException("Cannot submit an empty batch for verification.");
            }

            Status = JourneyBatchStatus.SubmittedForVerification;
            LastModifiedAt = DateTime.UtcNow;
        }

        // Behavior Method 3: Đánh dấu đã xác minh (Verifier)
        public void MarkAsVerified(DateTime verificationTime)
        {
            if (Status != JourneyBatchStatus.SubmittedForVerification)
            {
                throw new InvalidOperationException($"Cannot verify a batch in status {Status}. Must be {JourneyBatchStatus.SubmittedForVerification}.");
            }

            Status = JourneyBatchStatus.Verified;
            VerificationTime = verificationTime;
            LastModifiedAt = DateTime.UtcNow;
        }

        // Behavior Method 4: Đánh dấu đã bị từ chối
        public void MarkAsRejected()
        {
            if (Status != JourneyBatchStatus.SubmittedForVerification)
            {
                throw new InvalidOperationException($"Cannot reject a batch in status {Status}. Must be {JourneyBatchStatus.SubmittedForVerification}.");
            }

            Status = JourneyBatchStatus.Rejected;
            VerificationTime = DateTime.UtcNow;
            LastModifiedAt = DateTime.UtcNow;
        }

        // Behavior Method 5: Đánh dấu đã phát hành tín chỉ
        public void MarkAsCreditsIssued()
        {
            // Cho phép chuyển từ Verified (trạng thái trung gian) sang CreditsIssued
            if (Status != JourneyBatchStatus.Verified)
            {
                if (Status != JourneyBatchStatus.CreditsIssued)
                {
                    throw new InvalidOperationException($"Cannot issue credits for a batch in status {Status}. Must be {JourneyBatchStatus.Verified}.");
                }
            }

            Status = JourneyBatchStatus.CreditsIssued;
            LastModifiedAt = DateTime.UtcNow;
        }
    }
}