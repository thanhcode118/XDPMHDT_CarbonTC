using Domain.Common.Response;
using MediatR;

namespace Application.Common.Features.Listings.Commands.FinalizeExpiredAuction
{
    public class FinalizeExpiredAuctionCommand: IRequest<Result>
    {
        public Guid ListingId { get; set; }
    }
}
