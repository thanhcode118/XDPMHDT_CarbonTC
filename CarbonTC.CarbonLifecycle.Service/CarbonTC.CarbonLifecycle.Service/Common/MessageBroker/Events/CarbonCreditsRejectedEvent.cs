namespace CarbonTC.CarbonLifecycle.Service.Common.MessageBroker.Events
{
    // Event được publish khi yêu cầu phát hành tín chỉ bị từ chối.
    public class CarbonCreditsRejectedEvent
    {
        public Guid RequestId { get; set; } // Sử dụng RequestId để định danh yêu cầu bị từ chối
        public Guid OwnerId { get; set; }
        public string Remarks { get; set; }
    }
}