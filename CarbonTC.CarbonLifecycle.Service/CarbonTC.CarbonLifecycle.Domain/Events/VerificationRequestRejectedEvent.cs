// Sự kiện này có thể được phát ra khi một yêu cầu xác minh bị từ chối
using System;

namespace CarbonTC.CarbonLifecycle.Domain.Events
{
    public class VerificationRequestRejectedEvent : IDomainEvent
    {
        public Guid VerificationRequestId { get; }
        public Guid JourneyBatchId { get; }
        public string CVAId { get; }
        public string Reason { get; }
        public DateTime OccurredOn { get; } = DateTime.UtcNow;

        public VerificationRequestRejectedEvent(Guid verificationRequestId, Guid journeyBatchId, string CVAId, string reason)
        {
            VerificationRequestId = verificationRequestId;
            JourneyBatchId = journeyBatchId;
            CVAId = CVAId;
            Reason = reason;
        }
    }
}