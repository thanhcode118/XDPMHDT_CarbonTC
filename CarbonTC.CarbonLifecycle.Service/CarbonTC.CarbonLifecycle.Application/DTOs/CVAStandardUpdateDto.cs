using System;
using System.ComponentModel.DataAnnotations;

namespace CarbonTC.CarbonLifecycle.Application.DTOs
{
    public class CVAStandardUpdateDto
    {
        // Không cần [Required] ở đây vì ID sẽ lấy từ route hoặc query param
        // public Guid Id { get; set; }

        [StringLength(200)]
        public string? StandardName { get; set; } // Nullable để cho phép cập nhật từng phần

        [StringLength(100)]
        public string? VehicleType { get; set; }

        [Range(0.0001, double.MaxValue, ErrorMessage = "Conversion Rate must be positive.")]
        public decimal? ConversionRate { get; set; }

        [Range(0.0, double.MaxValue, ErrorMessage = "Minimum Distance Requirement must be non-negative.")]
        public decimal? MinDistanceRequirement { get; set; }

        public DateTime? EffectiveDate { get; set; }

        public DateTime? EndDate { get; set; } // Có thể set null để xóa EndDate

        public bool? IsActive { get; set; }
    }
}