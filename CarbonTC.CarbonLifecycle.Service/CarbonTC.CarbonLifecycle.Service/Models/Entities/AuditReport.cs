using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarbonTC.CarbonLifecycle.Service.Models.Entities
{
    public class AuditReport
    {
        [Key]
        public Guid ReportId { get; set; } // PK

        [Required]
        public Guid RequestId { get; set; } // FK to VerificationRequests.RequestId
        [ForeignKey("RequestId")]
        public VerificationRequest? VerificationRequest { get; set; } // Navigation property

        [Required]
        public Guid GeneratedBy { get; set; } // FK to User Service's UserId (CVA User)

        [Required]
        [StringLength(50)]
        public string ReportType { get; set; } = "Initial"; // Initial, FollowUp, Compliance

        public string? FilePath { get; set; } // Đường dẫn file PDF của báo cáo

        public string? Findings { get; set; } // JSON string của kết quả kiểm tra

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        public DateTime AuditDate { get; set; } // Ngày audit thực tế

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}