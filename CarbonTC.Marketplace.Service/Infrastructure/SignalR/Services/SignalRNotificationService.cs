using Application.Common.Features.Listings.DTOs;
using Application.Common.Interfaces;
using Domain.Events.AuctionBid;
using Infrastructure.SignalR.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace Infrastructure.SignalR.Services
{
    public class SignalRNotificationService : INotificationService
    {
        private readonly IHubContext<AuctionHub> _hubContext;

        public SignalRNotificationService(IHubContext<AuctionHub> hubContext)
        {
            _hubContext = hubContext;
        }
        public async Task NotifyAuctionEnded(AuctionCompletedDomainEvent winner)
        {
            await _hubContext.Clients.Group($"auction_{winner.ListingId}")
                .SendAsync("auctionended", new {
                    ListingId = winner.ListingId,
                    WinningBidderId = winner.WinningBidderId,
                    WinningBidAmount = winner.WinningBidAmount
                });
        }

        public async Task NotifyAuctionStarted(Guid listingId)
        {
            await _hubContext.Clients.Group($"auction_{listingId}").SendAsync("", "sdfsdf");
        }

        public async Task NotifyBidPlaced(Guid listingId, AuctionBidDto bidDto)
        {
            await _hubContext.Clients.Group($"auction_{listingId}")
                .SendAsync("bidplaced", bidDto);
        }

        public async Task NotifyUserOutbid(Guid userId, Guid listingId)
        {
            await _hubContext.Clients.User(userId.ToString())
                .SendAsync("useroutbid", listingId);
        }
    }
}
