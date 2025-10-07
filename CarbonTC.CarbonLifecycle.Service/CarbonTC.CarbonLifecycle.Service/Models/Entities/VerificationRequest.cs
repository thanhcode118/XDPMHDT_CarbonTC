using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using CarbonTC.CarbonLifecycle.Service.Models.Enums; // Sẽ tạo sau

namespace CarbonTC.CarbonLifecycle.Service.Models.Entities
{
    public class VerificationRequest
    {
        [Key]
        public Guid RequestId { get; set; } // PK

        [Required]
        public Guid OwnerId { get; set; } // FK to User Service's UserId (EV Owner)

        [Required]
        public Guid BatchId { get; set; } // FK to JourneyBatch.BatchId
        [ForeignKey("BatchId")]
        public JourneyBatch? JourneyBatch { get; set; } // Navigation property

        [Required]
        public Guid StandardId { get; set; } // FK to CVAStandards.StandardId
        [ForeignKey("StandardId")]
        public CVAStandard? CVAStandard { get; set; } // Navigation property

        [Required]
        public VerificationRequestStatus Status { get; set; } // Pending, Approved, Rejected, UnderReview

        public Guid? ReviewedBy { get; set; } // FK to User Service's UserId (CVA role)

        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ReviewedAt { get; set; }

        public string? Remarks { get; set; } // Ghi chú từ CVA
        public string? VerificationStandard { get; set; } // Tên tiêu chuẩn hoặc ID

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public ICollection<CarbonCredit>? CarbonCredits { get; set; }
        public ICollection<AuditReport>? AuditReports { get; set; }
    }
}