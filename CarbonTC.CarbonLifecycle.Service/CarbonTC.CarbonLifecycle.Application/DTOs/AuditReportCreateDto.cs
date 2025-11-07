using System;
using System.ComponentModel.DataAnnotations;

namespace CarbonTC.CarbonLifecycle.Application.DTOs
{
    public class AuditReportCreateDto
    {
        [Required]
        [StringLength(100)]
        public string EntityType { get; set; } = string.Empty; // VD: "VerificationRequest", "CVAStandard"

        [Required]
        public Guid EntityId { get; set; }

        [Required]
        [StringLength(100)]
        public string Action { get; set; } = string.Empty; // VD: "Approved", "Rejected", "Created", "Updated"

        public string? OriginalValuesJson { get; set; } // Dữ liệu cũ (dạng JSON string)

        public string? NewValuesJson { get; set; } // Dữ liệu mới (dạng JSON string)
    }
}