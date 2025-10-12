using Domain.Common.Response;
using Domain.Enum;
using MediatR;

namespace Application.Common.Features.Listings.Commands.UpdateListing
{
    public record UpdateListingCommand(
        Guid ListingId,
        ListingType Type,
        decimal PricePerUnit,
        ListingStatus Status,
        DateTime? ClosedAt, 
        decimal? MinimumBid,
        DateTime? AuctionEndTime 
    ): IRequest<Result>;
    
}
