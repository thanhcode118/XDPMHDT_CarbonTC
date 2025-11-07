using Domain.Common;

namespace Domain.Events.PriceSuggestion
{
    public record PriceSuggestionGeneratedDomainEvent(
        Guid SuggestionId,
        Guid ListingId,
        decimal SuggestedPrice,
        double ConfidenceScore
    ) : DomainEvent;
}
