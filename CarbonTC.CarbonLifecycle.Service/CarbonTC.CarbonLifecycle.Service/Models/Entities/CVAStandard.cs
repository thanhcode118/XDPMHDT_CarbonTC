using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CarbonTC.CarbonLifecycle.Service.Models.Entities
{
    public class CVAStandard
    {
        [Key]
        public Guid StandardId { get; set; } // PK

        [Required]
        [StringLength(100)]
        public string StandardName { get; set; } = string.Empty; // VERRA, GoldStandard, etc.

        public string? Description { get; set; }

        [Required]
        public decimal ConversionRate { get; set; } // Tỷ lệ quy đổi (kg CO2 to 1 credit)

        public double MinDistanceRequirement { get; set; } // Quãng đường tối thiểu để được cấp tín chỉ

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public ICollection<VerificationRequest>? VerificationRequests { get; set; }
    }
}