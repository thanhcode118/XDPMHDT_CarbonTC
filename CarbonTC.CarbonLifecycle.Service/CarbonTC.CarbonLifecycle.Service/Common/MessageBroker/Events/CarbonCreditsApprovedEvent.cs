namespace CarbonTC.CarbonLifecycle.Service.Common.MessageBroker.Events
{
    // Event được publish khi tín chỉ được CVA duyệt.
    public class CarbonCreditsApprovedEvent
    {
        public Guid CreditId { get; set; }
        public Guid OwnerId { get; set; }
        public decimal Amount { get; set; }
        public DateTime IssuedAt { get; set; }
        public string CreditSerialNumber { get; set; }
        public int Vintage { get; set; }
    }
}