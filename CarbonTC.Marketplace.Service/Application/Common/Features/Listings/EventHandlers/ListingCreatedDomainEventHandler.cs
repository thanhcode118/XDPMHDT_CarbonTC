using Application.Common.Features.Listings.Queries.GetPriceSuggestion;
using Application.Common.Interfaces;
using Domain.Events.Listing;
using Domain.ValueObject;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Application.Common.Features.Listings.EventHandlers
{
    public class ListingCreatedDomainEventHandler : INotificationHandler<ListingCreatedDomainEvent>
    {
        private readonly IMediator _mediator;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<ListingCreatedDomainEventHandler> _logger;

        public ListingCreatedDomainEventHandler(
            IMediator mediator,
            IUnitOfWork unitOfWork,
            ILogger<ListingCreatedDomainEventHandler> logger)
        {
            _mediator = mediator;
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task Handle(ListingCreatedDomainEvent notification, CancellationToken cancellationToken)
        {
            var listing = await _unitOfWork.Listings.GetByIdAsync(notification.ListingId, cancellationToken);
            if (listing == null)
            {
                _logger.LogWarning("Listing not found: {ListingId}", notification.ListingId);
                return;
            }

            var result = await _mediator.Send(new GetPriceSuggestionQuery
            {
                CreditId = notification.CreditId,
                Quantity = (float)notification.Quantity
            }, cancellationToken);

            if (result.IsSuccess)
            {
                var reasoning = new PriceSuggestionReasoning(
                    averageMarketPrice: (decimal)result.Value, 
                    medianMarketPrice: (decimal)result.Value,  
                    recentTransactionCount: 10, 
                    priceVolatility: 0.05m,     
                    marketTrend: "Stable",
                    factors: new List<string>
                    {
                        "Market analysis",
                        "Historical data",
                        "Current demand"
                    }
                );

                listing.AddPriceSuggestion((decimal)result.Value, 0.9, reasoning);
                await _unitOfWork.Listings.UpdateAsync(listing);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                _logger.LogInformation("Price suggestion added to listing: {ListingId}", notification.ListingId);
            }
            else
            {
                _logger.LogWarning("Failed to get price suggestion for listing: {ListingId}", notification.ListingId);
            }
        }
    }
}