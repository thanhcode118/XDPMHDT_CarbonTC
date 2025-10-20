using Application.Common.Features.Listings.DTOs;
using Domain.Common.Response;
using MediatR;

namespace Application.Common.Features.Listings.Commands.Auctions
{
    public record AuctionCommand : IRequest<Result<Object>>
    {
        public Guid ListingId { get; init; }
        public decimal BidAmount { get; init; }
    }
}
