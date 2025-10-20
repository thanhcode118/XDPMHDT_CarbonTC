using Application.Common.Interfaces;
using Domain.Events.AuctionBid;
using Domain.Events.Listing;
using MediatR;
using SharedLibrary.Interfaces;

namespace Application.Common.Features.Listings.EventHandlers
{
    public class AuctionCompletedDomainEventHandler : INotificationHandler<AuctionCompletedDomainEvent>
    {
        private readonly IMessagePublisher _publisher;
        private readonly INotificationService _notification;
        private readonly IMediator _mediator;
        private readonly IUnitOfWork _unitOfWork;

        public AuctionCompletedDomainEventHandler(IMessagePublisher publisher, INotificationService notification, IMediator mediator, IUnitOfWork unitOfWork)
        {
            _publisher = publisher;
            _notification = notification;
            _mediator = mediator;
            _unitOfWork = unitOfWork;
        }

        public async Task Handle(AuctionCompletedDomainEvent notification, CancellationToken cancellationToken)
        {
            // Send information Winner
            await _notification.NotifyAuctionEnded(notification);

            // Send Mail 
            await _publisher.PublishAsync("auction_completed", new
            {
                ListingId = notification.ListingId,
                WinningBidderId = notification.WinningBidderId,
                OwnerId = notification.OwnerId,
                WinningBidAmount = notification.WinningBidAmount
            });

            if (notification.WinningBidderId != null)
            {
                var creditInventories = await _unitOfWork.CreditInventories.GetByCreditIdAsync(notification.CreditId);
                var listingPurchasedEvent = new ListingPurchasedDomainEvent(
                    ListingId: notification.ListingId,
                    CreditId: notification.CreditId,
                    BuyerId: notification.WinningBidderId,
                    OwerId: notification.OwnerId,
                    Amount: notification.Quantity, 
                    TotalPrice: notification.WinningBidAmount
                );
                await _mediator.Publish(listingPurchasedEvent, cancellationToken);
            }
        }
    }
}
