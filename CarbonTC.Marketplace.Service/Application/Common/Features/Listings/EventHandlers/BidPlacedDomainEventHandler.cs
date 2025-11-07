using Application.Common.Features.Listings.DTOs;
using Application.Common.Interfaces;
using Domain.Events.AuctionBid;
using MediatR;

namespace Application.Common.Features.Listings.EventHandlers
{
    public class BidPlacedDomainEventHandler : INotificationHandler<BidPlacedDomainEvent>
    {
        private readonly INotificationService _notificationService;

        public BidPlacedDomainEventHandler(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        public async Task Handle(BidPlacedDomainEvent notification, CancellationToken cancellationToken)
        {
            var bidDto = new AuctionBidDto
            {
                ListingId = notification.ListingId,
                BidderId = notification.BidderId,
                BidAmount = notification.BidAmount,
                BidTime = notification.BidTime
            };
            await _notificationService.NotifyBidPlaced(notification.ListingId, bidDto);

            if (notification.previousWinnerId != null)
            {
                await _notificationService.NotifyUserOutbid(notification.previousWinnerId.Value, notification.ListingId);
            }
        }
    }
}
