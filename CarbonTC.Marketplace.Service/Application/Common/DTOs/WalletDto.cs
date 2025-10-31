using System.Text.Json.Serialization;

namespace Application.Common.DTOs
{
    public class WalletResponseDto<T>
    {
        [JsonPropertyName("success")]
        public bool Success { get; set; }

        [JsonPropertyName("message")]
        public string? Message { get; set; }

        [JsonPropertyName("data")]
        public T? Data { get; set; }

        [JsonPropertyName("errors")]
        public object? Errors { get; set; }

        [JsonPropertyName("timestamp")]
        public DateTime? Timestamp { get; set; }
    }


    public class WalletDto
    {
        [JsonPropertyName("walletId")]
        public int WalletId { get; set; }

        [JsonPropertyName("userId")]
        public string UserId { get; set; }

        [JsonPropertyName("balance")]
        public decimal Balance { get; set; }

        [JsonPropertyName("currency")]
        public string Currency { get; set; }

        [JsonPropertyName("updatedAt")]
        public DateTime UpdatedAt { get; set; }
    }
}
