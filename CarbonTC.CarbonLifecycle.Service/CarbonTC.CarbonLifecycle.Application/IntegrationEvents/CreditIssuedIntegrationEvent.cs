using System;
using System.Text.Json.Serialization;

namespace CarbonTC.CarbonLifecycle.Application.IntegrationEvents
{
    // DTO này khớp với yêu cầu từ Service Payment & Infrastructure 
    public class CreditIssuedIntegrationEvent
    {
        // Đã sửa 'ld' thành 'Id' để phù hợp với C# naming, giữ nguyên JSON property name
        [JsonPropertyName("ownerUserId")] // <--- Đã sửa OwnerUserld -> ownerUserId
        public string OwnerUserId { get; set; }

        [JsonPropertyName("creditAmount")] 
        public decimal CreditAmount { get; set; }

        [JsonPropertyName("referenceId")] // <--- Đã sửa referenceld -> referenceId
        public string ReferenceId { get; set; }

        // Dùng DateTimeOffset để đảm bảo tuân thủ ISO 8601 chính xác
        [JsonPropertyName("issuedAt")] 
        public DateTimeOffset IssuedAt { get; set; } // <--- Đã đổi thành DateTimeOffset

        public CreditIssuedIntegrationEvent()
        {
            IssuedAt = DateTimeOffset.UtcNow; // Khởi tạo bằng UTC
        }
    }
}