using Application.Common.Interfaces;
using Domain.Enum;
using Domain.Events.Transactions;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Application.Common.Features.Transactions.EventHandlers
{
    public class TransactionFailedDomainEventHandler : INotificationHandler<TransactionFailedDomainEvent>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IBalanceService _balanceService;
        private readonly ILogger<TransactionFailedDomainEventHandler> _logger;

        public TransactionFailedDomainEventHandler(IUnitOfWork unitOfWork,IBalanceService balanceService, ILogger<TransactionFailedDomainEventHandler> logger)
        {
            _unitOfWork = unitOfWork;
            _balanceService = balanceService;
            _logger = logger;
        }

        public async Task Handle(TransactionFailedDomainEvent notification, CancellationToken cancellationToken)
        {
            var listing = await _unitOfWork.Listings.GetByIdAsync(notification.ListingId, cancellationToken);

            if (listing == null)
            {
                _logger.LogWarning($"Không tìm thấy ListingId: {notification.ListingId} khi xử lý TransactionFailedEvent. Không thể hoàn tiền.");
                return;
            }

            if (listing.Type == ListingType.Auction)
                await _balanceService.ReleaseBalanceForAuctionAsync(notification.BuyerId, notification.ListingId);
            else
                await _balanceService.ReleaseBalanceForPurchaseAsync(notification.BuyerId, notification.TotalAmount);
        }
    }
}
