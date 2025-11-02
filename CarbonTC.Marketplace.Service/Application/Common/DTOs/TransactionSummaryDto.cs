namespace Application.Common.DTOs
{
    public class TransactionSummaryDto
    {
        public int TotalTransactions { get; init; }
        public decimal TotalTransactionsChange { get; init; } 

        public int SuccessfulTransactions { get; init; }
        public decimal SuccessfulTransactionsChange { get; init; } 

        public int PendingTransactions { get; init; }
        public decimal PendingTransactionsChange { get; init; } 

        public decimal TotalRevenue { get; init; } 
        public decimal TotalRevenueChange { get; init; } 
    }
}
