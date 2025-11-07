// Sự kiện này có thể được phát ra khi một yêu cầu xác minh được phê duyệt
using System;

namespace CarbonTC.CarbonLifecycle.Domain.Events
{
    public class VerificationRequestApprovedEvent : IDomainEvent
    {
        public Guid VerificationRequestId { get; }
        public Guid JourneyBatchId { get; }
        public string VerifierId { get; }
        public DateTime OccurredOn { get; } = DateTime.UtcNow;

        public VerificationRequestApprovedEvent(Guid verificationRequestId, Guid journeyBatchId, string verifierId)
        {
            VerificationRequestId = verificationRequestId;
            JourneyBatchId = journeyBatchId;
            VerifierId = verifierId;
        }
    }
}