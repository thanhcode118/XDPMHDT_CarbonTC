// Sự kiện này có thể được phát ra khi một yêu cầu xác minh bị từ chối
using System;

namespace CarbonTC.CarbonLifecycle.Domain.Events
{
    public class VerificationRequestRejectedEvent : IDomainEvent
    {
        public Guid VerificationRequestId { get; }
        public Guid JourneyBatchId { get; }
        public string VerifierId { get; }
        public string Reason { get; }
        public DateTime OccurredOn { get; } = DateTime.UtcNow;

        public VerificationRequestRejectedEvent(Guid verificationRequestId, Guid journeyBatchId, string verifierId, string reason)
        {
            VerificationRequestId = verificationRequestId;
            JourneyBatchId = journeyBatchId;
            VerifierId = verifierId;
            Reason = reason;
        }
    }
}