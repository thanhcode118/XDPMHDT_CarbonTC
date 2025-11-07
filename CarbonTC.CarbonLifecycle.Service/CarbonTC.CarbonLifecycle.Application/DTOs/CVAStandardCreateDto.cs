using System;
using System.ComponentModel.DataAnnotations;

namespace CarbonTC.CarbonLifecycle.Application.DTOs
{
    public class CVAStandardCreateDto
    {
        [Required]
        [StringLength(200)]
        public string StandardName { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string VehicleType { get; set; } = string.Empty;

        [Required]
        [Range(0.0001, double.MaxValue, ErrorMessage = "Conversion Rate must be positive.")]
        public decimal ConversionRate { get; set; }

        [Required]
        [Range(0.0, double.MaxValue, ErrorMessage = "Minimum Distance Requirement must be non-negative.")]
        public decimal MinDistanceRequirement { get; set; }

        [Required]
        public DateTime EffectiveDate { get; set; }

        public DateTime? EndDate { get; set; }

        public bool IsActive { get; set; } = true; // Mặc định là active
    }
}