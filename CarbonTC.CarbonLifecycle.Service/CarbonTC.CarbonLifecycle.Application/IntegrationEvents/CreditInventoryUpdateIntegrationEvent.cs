using System;
using System.Text.Json.Serialization;

namespace CarbonTC.CarbonLifecycle.Application.IntegrationEvents
{
    // DTO này khớp với yêu cầu từ Service Marketplace & Trading Service
    // Bỏ IDomainEvent để nó trở thành Integration Event thuần túy.
    public class CreditInventoryUpdateIntegrationEvent 
    {
        // Service 3 yêu cầu Guid CreditId 
        [JsonPropertyName("creditId")]
        public Guid CreditId { get; set; }

        // Service 3 yêu cầu decimal TotalAmount 
        [JsonPropertyName("totalAmount")]
        public decimal TotalAmount { get; set; }
    }
}