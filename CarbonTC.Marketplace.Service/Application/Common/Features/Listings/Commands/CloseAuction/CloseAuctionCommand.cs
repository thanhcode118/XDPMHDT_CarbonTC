using Domain.Common.Response;
using MediatR;

namespace Application.Common.Features.Listings.Commands.CloseAuction
{
    public class CloseAuctionCommand : IRequest<Result>
    {
        public Guid ListingId { get; set; }
    }
}
