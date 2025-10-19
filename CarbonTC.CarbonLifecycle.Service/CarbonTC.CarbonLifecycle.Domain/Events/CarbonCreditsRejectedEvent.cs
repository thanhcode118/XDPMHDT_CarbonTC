//Sự kiện này sẽ được phát ra khi một yêu cầu xác minh bị từ chối, dẫn đến việc không tạo ra hoặc từ chối các tín chỉ carbon.

using System;
using CarbonTC.CarbonLifecycle.Domain.Enums; // Để tham chiếu JourneyBatchStatus

namespace CarbonTC.CarbonLifecycle.Domain.Events
{
    public class CarbonCreditsRejectedEvent : IDomainEvent
    {
        public Guid JourneyBatchId { get; }
        public string RequestorId { get; }
        public string Reason { get; }
        public DateTime OccurredOn { get; } = DateTime.UtcNow;

        public CarbonCreditsRejectedEvent(Guid journeyBatchId, string requestorId, string reason)
        {
            JourneyBatchId = journeyBatchId;
            RequestorId = requestorId;
            Reason = reason;
        }
    }
}