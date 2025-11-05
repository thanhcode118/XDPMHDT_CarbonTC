using System;
using System.Collections.Generic;

namespace CarbonTC.CarbonLifecycle.Domain.Entities
{
    public class CVAStandard : BaseEntity
    {
        public Guid Id { get; private set; }
        public string StandardName { get; private set; }
        public string VehicleType { get; private set; }
        public decimal ConversionRate { get; private set; }
        public decimal MinDistanceRequirement { get; private set; }
        public DateTime EffectiveDate { get; private set; }
        public DateTime? EndDate { get; private set; }
        public bool IsActive { get; private set; }

        public ICollection<VerificationRequest> VerificationRequests { get; set; }

        // Private constructor cho EF Core và Serialization
        private CVAStandard()
        {
            StandardName = string.Empty;
            VehicleType = string.Empty;
            VerificationRequests = new List<VerificationRequest>();
        }

        // Factory Method 
        public static CVAStandard Create(
            string standardName,
            string vehicleType,
            decimal conversionRate,
            decimal minDistanceRequirement,
            DateTime effectiveDate,
            DateTime? endDate,
            bool isActive)
        {
            if (string.IsNullOrWhiteSpace(standardName)) throw new ArgumentException("StandardName cannot be empty.", nameof(standardName));

            return new CVAStandard
            {
                Id = Guid.NewGuid(),
                StandardName = standardName,
                VehicleType = vehicleType,
                ConversionRate = conversionRate,
                MinDistanceRequirement = minDistanceRequirement,
                EffectiveDate = effectiveDate,
                EndDate = endDate,
                IsActive = isActive,
                CreatedAt = DateTime.UtcNow
            };
        }


        // Behavior Method: Cập nhật chi tiết (sử dụng trong UpdateCVAStandardCommandHandler)
        public void UpdateDetails(
            string? standardName,
            string? vehicleType,
            decimal? conversionRate,
            decimal? minDistanceRequirement,
            DateTime? effectiveDate,
            DateTime? endDate,
            bool? isActive)
        {
            // Chỉ cập nhật nếu giá trị mới không null (hoặc không rỗng đối với string)
            StandardName = standardName ?? StandardName;
            VehicleType = vehicleType ?? VehicleType;

            if (conversionRate.HasValue)
            {
                if (conversionRate.Value <= 0) throw new ArgumentException("Conversion Rate must be positive.", nameof(conversionRate));
                ConversionRate = conversionRate.Value;
            }

            if (minDistanceRequirement.HasValue)
            {
                if (minDistanceRequirement.Value < 0) throw new ArgumentException("Minimum Distance Requirement must be non-negative.", nameof(minDistanceRequirement));
                MinDistanceRequirement = minDistanceRequirement.Value;
            }

            EffectiveDate = effectiveDate ?? EffectiveDate;
            EndDate = endDate;
            IsActive = isActive ?? IsActive;

            LastModifiedAt = DateTime.UtcNow;
        }
    }
}