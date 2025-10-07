using Domain.Exceptions;

namespace Domain.ValueObject
{
    public class PriceSuggestionReasoning
    {
        public decimal AverageMarketPrice { get; init; }
        public decimal MedianMarketPrice { get; init; }
        public int RecentTransactionCount { get; init; }
        public decimal PriceVolatility { get; init; }
        public string MarketTrend { get; init; } // "Increasing", "Stable", "Decreasing"
        public List<string> Factors { get; init; } = new();

        public PriceSuggestionReasoning(
            decimal averageMarketPrice,
            decimal medianMarketPrice,
            int recentTransactionCount,
            decimal priceVolatility,
            string marketTrend,
            List<string> factors)
        {
            if (averageMarketPrice < 0 || medianMarketPrice < 0)
                throw new DomainException("Market prices cannot be negative");

            if (recentTransactionCount < 0)
                throw new DomainException("Transaction count cannot be negative");

            if (priceVolatility < 0)
                throw new DomainException("Price volatility cannot be negative");

            AverageMarketPrice = averageMarketPrice;
            MedianMarketPrice = medianMarketPrice;
            RecentTransactionCount = recentTransactionCount;
            PriceVolatility = priceVolatility;
            MarketTrend = marketTrend;
            Factors = factors ?? new List<string>();
        }
    }
}
