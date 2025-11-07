using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations; // Thêm using này

namespace CarbonTC.CarbonLifecycle.Application.DTOs
{
    public class VerificationRequestReviewDto
    {
        [Required]
        public Guid VerificationRequestId { get; set; }

        [Required]
        public bool IsApproved { get; set; } // true = duyệt, false = từ chối

        // Thông tin cho AuditFindings
        [Required]
        [StringLength(500, MinimumLength = 10, ErrorMessage = "Audit summary must be between 10 and 500 characters.")]
        public string AuditSummary { get; set; } = string.Empty; // Khởi tạo để tránh null

        public List<string>? AuditIssues { get; set; } // Danh sách các vấn đề phát hiện (nếu có)

        [Required]
        public bool IsAuditSatisfactory { get; set; } // Kết quả audit có đạt yêu cầu không?

        [StringLength(1000, ErrorMessage = "Notes cannot exceed 1000 characters.")]
        public string? Notes { get; set; } // Ghi chú chung của CVA

        // Chỉ cần thiết nếu IsApproved = false
        [StringLength(1000, ErrorMessage = "Rejection reason cannot exceed 1000 characters.")]
        public string? ReasonForRejection { get; set; }

        // Chỉ cần thiết nếu IsApproved = true
        // Validate Guid không rỗng nếu IsApproved = true (có thể làm trong Handler hoặc dùng custom validation attribute)
        public Guid? CvaStandardId { get; set; } // ID của CVAStandard được áp dụng
    }
}