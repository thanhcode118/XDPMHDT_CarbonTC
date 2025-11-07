using Application.Common.Interfaces;
using Domain.Events.AuctionBid;
using MediatR;
using SharedLibrary.Interfaces;

namespace Application.Common.Features.Listings.EventHandlers
{
    public class AuctionCompletedWithoutBidsDomainEventHandler : INotificationHandler<AuctionCompletedWithoutBidsDomainEvent>
    {
        private readonly IIntegrationEventService _integrationEventService;

        public AuctionCompletedWithoutBidsDomainEventHandler(IIntegrationEventService integrationEventService)
        {
            _integrationEventService = integrationEventService;
        }

        public async Task Handle(AuctionCompletedWithoutBidsDomainEvent notification, CancellationToken cancellationToken)
        {
            // Send Mail
            await _integrationEventService.PublishToQueueAsync("auction_completed_without_bids", new
            {
                ListingId = notification.ListingId,
                OwnerId = notification.OwnerId
            });
        }
    }
}
