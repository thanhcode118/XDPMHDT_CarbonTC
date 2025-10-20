using Domain.Events.AuctionBid;
using MediatR;
using SharedLibrary.Interfaces;

namespace Application.Common.Features.Listings.EventHandlers
{
    public class AuctionCompletedWithoutBidsDomainEventHandler : INotificationHandler<AuctionCompletedWithoutBidsDomainEvent>
    {
        private readonly IMessagePublisher _publisher;

        public AuctionCompletedWithoutBidsDomainEventHandler(IMessagePublisher publisher)
        {
            _publisher = publisher;
        }

        public async Task Handle(AuctionCompletedWithoutBidsDomainEvent notification, CancellationToken cancellationToken)
        {
            // Send Mail
            await _publisher.PublishAsync("auction_completed_without_bids", new
            {
                ListingId = notification.ListingId,
                OwnerId = notification.OwnerId
            });
        }
    }
}
