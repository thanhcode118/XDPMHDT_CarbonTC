using Domain.Common.Response;
using MediatR;

namespace Application.Common.Features.Listings.Queries.GetPriceSuggestion
{
    public record GetPriceSuggestionQuery: IRequest<Result<float>>
    {
        public Guid? CreditId { get; set; }
        public float? Quantity { get; set; }
    }
}
