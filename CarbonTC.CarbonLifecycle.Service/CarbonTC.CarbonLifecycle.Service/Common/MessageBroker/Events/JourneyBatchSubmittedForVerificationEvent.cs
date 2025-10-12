namespace CarbonTC.CarbonLifecycle.Service.Common.MessageBroker.Events
{
    // Event được publish khi EV Owner gửi một lô hành trình để xác minh.
    public class JourneyBatchSubmittedForVerificationEvent
    {
        public Guid BatchId { get; set; }
        public Guid OwnerId { get; set; }
        public DateTime SubmittedAt { get; set; }
    }
}