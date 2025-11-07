using Domain.Common.Response;
using MediatR;

namespace Application.Common.Features.Listings.Commands.BuyNow
{
    public record BuyNowCommand: IRequest<Result>
    {
        public Guid ListingId { get; init; }
        public decimal Amount { get; init; }
    }
}
