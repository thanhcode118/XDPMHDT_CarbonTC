//Sự kiện này sẽ được phát ra khi một JourneyBatch được xác minh thành công và các tín chỉ carbon được tạo/phê duyệt..

using System;
using CarbonTC.CarbonLifecycle.Domain.ValueObjects; // Để sử dụng CreditAmount

namespace CarbonTC.CarbonLifecycle.Domain.Events
{
    public class CarbonCreditsApprovedEvent : IDomainEvent
    {
        public Guid JourneyBatchId { get; }
        public string UserId { get; }
        public CreditAmount ApprovedCreditAmount { get; } // Sử dụng Value Object
        public DateTime OccurredOn { get; } = DateTime.UtcNow;

        public CarbonCreditsApprovedEvent(Guid journeyBatchId, string userId, CreditAmount approvedCreditAmount)
        {
            JourneyBatchId = journeyBatchId;
            UserId = userId;
            ApprovedCreditAmount = approvedCreditAmount;
        }
    }
}