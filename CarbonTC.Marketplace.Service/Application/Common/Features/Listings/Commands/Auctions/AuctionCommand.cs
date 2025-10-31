using Application.Common.DTOs;
using Domain.Common.Response;
using MediatR;

namespace Application.Common.Features.Listings.Commands.Auctions
{
    public record AuctionCommand : IRequest<Result<AuctionBidResponse>>
    {
        public Guid ListingId { get; init; }
        public decimal BidAmount { get; init; }
    }
}
