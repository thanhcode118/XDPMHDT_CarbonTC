using MediatR;

namespace Application.Common.Features.Listings.Commands.CloseAuction
{
    public class CloseAuctionCommand : IRequest
    {
        public Guid ListingId { get; set; }
    }
}
