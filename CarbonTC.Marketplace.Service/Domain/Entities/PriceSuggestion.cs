using Domain.Common;
using Domain.Exceptions;
using Domain.ValueObject;

namespace Domain.Entities
{
    public class PriceSuggestion: BaseEntity
    {
        public Guid ListingId { get; private set; }
        public decimal SuggestedPrice { get; private set; }
        public double ConfidenceScore { get; private set; }
        public string ReasoningJson { get; private set; }

        private PriceSuggestion() { }

        private PriceSuggestion(
            Guid listingId,
            decimal suggestedPrice,
            double confidenceScore,
            string reasoningJson)
        {
            ListingId = listingId;
            SuggestedPrice = suggestedPrice;
            ConfidenceScore = confidenceScore;
            ReasoningJson = reasoningJson;
        }

        public static PriceSuggestion Create(
            Guid listingId,
            decimal suggestedPrice,
            double confidenceScore,
            PriceSuggestionReasoning reasoning)
        {
            if (suggestedPrice <= 0)
                throw new DomainException("Suggested price must be greater than zero");

            if (confidenceScore < 0 || confidenceScore > 1)
                throw new DomainException("Confidence score must be between 0 and 1");

            var reasoningJson = System.Text.Json.JsonSerializer.Serialize(reasoning);

            return new PriceSuggestion(listingId, suggestedPrice, confidenceScore, reasoningJson);
        }
    }
}
