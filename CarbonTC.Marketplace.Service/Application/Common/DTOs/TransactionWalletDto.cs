using System.Text.Json.Serialization;

namespace Application.Common.DTOs
{
    public record TransactionWalletDto
    {
        [JsonPropertyName("transactionId")]
        public string TransactionId { get; init; } = string.Empty;
        [JsonPropertyName("buyerUserId")]
        public string BuyerUserId { get; init; } = string.Empty;
        [JsonPropertyName("sellerUserId")]
        public string SellerUserId { get; init; } = string.Empty;
        [JsonPropertyName("moneyAmount")]
        public decimal MoneyAmount { get; init; }
        [JsonPropertyName("creditAmount")]
        public decimal CreditAmount { get; init; }
        [JsonPropertyName("platformFee")]
        public decimal PlatformFee { get; init; }
        [JsonPropertyName("createdAt")]
        public string CreatedAt { get; init; }
    }
}