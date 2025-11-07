using System;
using CarbonTC.CarbonLifecycle.Domain.Enums; // Cần using này

namespace CarbonTC.CarbonLifecycle.Application.DTOs
{
    public class VerificationRequestSummaryDto
    {
        public Guid Id { get; set; }
        public Guid JourneyBatchId { get; set; }
        public string RequestorId { get; set; } = string.Empty;
        public DateTime RequestDate { get; set; }
        public VerificationRequestStatus Status { get; set; }
    }
}