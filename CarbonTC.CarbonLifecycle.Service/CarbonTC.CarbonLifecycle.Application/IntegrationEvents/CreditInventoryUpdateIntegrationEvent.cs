using CarbonTC.CarbonLifecycle.Domain.Events;
using System.Text.Json.Serialization;

namespace CarbonTC.CarbonLifecycle.Application.IntegrationEvents
{
    // DTO này khớp với yêu cầu từ Service Marketplace & Trading Service
    public class CreditInventoryUpdateIntegrationEvent : IDomainEvent
    {
        // Service 3 yêu cầu Guid CreditId 
        public Guid CreditId { get; set; }

        // Service 3 yêu cầu decimal TotalAmount 
        public decimal TotalAmount { get; set; }

        // IDomainEvent implementation
        [JsonIgnore] // Không gửi trường này trong JSON
        public DateTime OccurredOn { get; } = DateTime.UtcNow;
    }
}