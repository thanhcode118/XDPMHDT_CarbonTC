using System;
using System.Collections.Generic;
using CarbonTC.CarbonLifecycle.Domain.Enums;

namespace CarbonTC.CarbonLifecycle.Application.DTOs
{
    public class VerificationRequestDto
    {
        public Guid Id { get; set; }
        public Guid JourneyBatchId { get; set; }
        public string RequestorId { get; set; } = string.Empty;
        public string? VerifierId { get; set; }
        public DateTime RequestDate { get; set; }
        public DateTime? VerificationDate { get; set; }
        public VerificationRequestStatus Status { get; set; }
        public string? Notes { get; set; }
        public Guid? CvaStandardId { get; set; }

        // Thêm thông tin liên quan nếu cần
        public JourneyBatchDto? JourneyBatch { get; set; } // Map từ JourneyBatch entity
        public CvaStandardDto? AppliedStandard { get; set; } // Map từ CVAStandard entity
        public List<CarbonCreditDto>? IssuedCredits { get; set; } // Map từ CarbonCredits collection
    }
}