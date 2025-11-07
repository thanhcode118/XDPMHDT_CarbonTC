//sự kiện khi một yêu cầu xác minh mới được tạo
using System;

namespace CarbonTC.CarbonLifecycle.Domain.Events
{
    public class VerificationRequestCreatedEvent : IDomainEvent
    {
        public Guid VerificationRequestId { get; }
        public Guid JourneyBatchId { get; }
        public string RequestorId { get; }
        public DateTime OccurredOn { get; } = DateTime.UtcNow;

        public VerificationRequestCreatedEvent(Guid verificationRequestId, Guid journeyBatchId, string requestorId)
        {
            VerificationRequestId = verificationRequestId;
            JourneyBatchId = journeyBatchId;
            RequestorId = requestorId;
        }
    }
}