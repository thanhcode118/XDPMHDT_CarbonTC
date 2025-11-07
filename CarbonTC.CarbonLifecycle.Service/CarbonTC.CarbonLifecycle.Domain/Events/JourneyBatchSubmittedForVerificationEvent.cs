//Sự kiện này sẽ được phát ra khi một JourneyBatch được gửi đi để xác minh.

using System;

namespace CarbonTC.CarbonLifecycle.Domain.Events
{
    public class JourneyBatchSubmittedForVerificationEvent : IDomainEvent
    {
        public Guid JourneyBatchId { get; }
        public string RequestorId { get; }
        public DateTime OccurredOn { get; } = DateTime.UtcNow;

        public JourneyBatchSubmittedForVerificationEvent(Guid journeyBatchId, string requestorId)
        {
            JourneyBatchId = journeyBatchId;
            RequestorId = requestorId;
        }
    }
}