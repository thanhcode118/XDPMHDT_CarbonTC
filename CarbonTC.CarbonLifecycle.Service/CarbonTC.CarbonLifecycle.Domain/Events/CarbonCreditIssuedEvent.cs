// Sự kiện này được phát ra khi một Carbon Credit được phát hành trực tiếp (không qua verification process)
// Khác với CarbonCreditsApprovedEvent - được phát khi duyệt verification request
using System;
using CarbonTC.CarbonLifecycle.Domain.ValueObjects;

namespace CarbonTC.CarbonLifecycle.Domain.Events
{
    public class CarbonCreditIssuedEvent : IDomainEvent
    {
        public Guid JourneyBatchId { get; }
        public string UserId { get; }
        public Guid CreditId { get; }
        public decimal AmountKgCO2e { get; } // Sử dụng decimal thay vì CreditAmount vì đây là phát hành trực tiếp
        public DateTime OccurredOn { get; } = DateTime.UtcNow;

        public CarbonCreditIssuedEvent(Guid journeyBatchId, string userId, Guid creditId, decimal amountKgCO2e)
        {
            JourneyBatchId = journeyBatchId;
            UserId = userId;
            CreditId = creditId;
            AmountKgCO2e = amountKgCO2e;
        }
    }
}

