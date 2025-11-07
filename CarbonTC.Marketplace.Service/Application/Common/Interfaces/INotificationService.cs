using Application.Common.Features.Listings.DTOs;
using Domain.Events.AuctionBid;

namespace Application.Common.Interfaces
{
    public interface INotificationService
    {
        Task NotifyBidPlaced(Guid listingId, AuctionBidDto bidDto);
        Task NotifyAuctionStarted(Guid listingId);
        Task NotifyAuctionEnded(AuctionCompletedDomainEvent winner);
        Task NotifyUserOutbid(Guid userId, Guid listingId);
    }
}
