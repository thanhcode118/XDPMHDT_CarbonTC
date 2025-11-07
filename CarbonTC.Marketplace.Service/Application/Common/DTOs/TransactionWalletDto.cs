namespace Application.Common.DTOs
{
    public record TransactionWalletDto
    {
        public string TransactionId { get; init; } = string.Empty;        
        public string BuyerUserId { get; init; } = string.Empty;          
        public string SellerUserId { get; init; } = string.Empty;        
        public decimal MoneyAmount { get; init; }
        public decimal CreditAmount { get; init; }
        public decimal PlatformFee { get; init; }
        public string CreatedAt { get; init; }
    }
}