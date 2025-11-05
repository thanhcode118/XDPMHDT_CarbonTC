namespace Application.Common.DTOs
{
    public class DashboardWalletSummaryDto
    {
        public int ListingsFound { get; init; }
        public decimal ListingsFoundChangePercent { get; init; }

        public int ListingsSold { get; init; }
        public decimal ListingsSoldChangePercent { get; init; }

        public decimal AveragePrice { get; init; }
        public decimal AveragePriceChangePercent { get; init; }

        public int SuccessfulTransactions { get; init; }
        public decimal SuccessfulTransactionsChangePercent { get; init; }
    }
}
