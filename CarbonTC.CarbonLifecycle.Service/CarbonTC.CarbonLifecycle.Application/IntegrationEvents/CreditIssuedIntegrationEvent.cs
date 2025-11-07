using CarbonTC.CarbonLifecycle.Domain.Events;
using System.Text.Json.Serialization;

namespace CarbonTC.CarbonLifecycle.Application.IntegrationEvents
{
    // DTO này khớp với yêu cầu từ Service Payment & Infrastructure 
    public class CreditIssuedIntegrationEvent : IDomainEvent
    {
        [JsonPropertyName("ownerUserld")] 
        public string OwnerUserId { get; set; }

        [JsonPropertyName("creditAmount")] 
        public decimal CreditAmount { get; set; }

        [JsonPropertyName("referenceld")] 
        public string ReferenceId { get; set; }

        [JsonPropertyName("issuedAt")] 
        public DateTime IssuedAt { get; set; }

        // IDomainEvent implementation
        [JsonIgnore] 
        public DateTime OccurredOn { get; } = DateTime.UtcNow;

        public CreditIssuedIntegrationEvent()
        {
            // Cập nhật IssuedAt khi khởi tạo
            IssuedAt = DateTime.UtcNow;
        }
    }
}