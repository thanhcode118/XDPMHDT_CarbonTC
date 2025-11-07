using Application.Common.Interfaces;
using Domain.Events.AuctionBid;
using Domain.Events.Listing;
using MediatR;

namespace Application.Common.Features.Listings.EventHandlers
{
    public class AuctionCompletedDomainEventHandler : INotificationHandler<AuctionCompletedDomainEvent>
    {
        private readonly IIntegrationEventService _integrationEventService;
        private readonly INotificationService _notification;
        private readonly IMediator _mediator;
        private readonly IUnitOfWork _unitOfWork;

        public AuctionCompletedDomainEventHandler(IIntegrationEventService integrationEventService, INotificationService notification, IMediator mediator, IUnitOfWork unitOfWork)
        {
            _integrationEventService = integrationEventService;
            _notification = notification;
            _mediator = mediator;
            _unitOfWork = unitOfWork;
        }

        public async Task Handle(AuctionCompletedDomainEvent notification, CancellationToken cancellationToken)
        {
            // Send information Winner
            await _notification.NotifyAuctionEnded(notification);

            // Send Mail 
            await _integrationEventService.PublishToQueueAsync("auction_completed", new
            {
                ListingId = notification.ListingId,
                WinningBidderId = notification.WinningBidderId,
                OwnerId = notification.OwnerId,
                WinningBidAmount = notification.WinningBidAmount
            });

            
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
