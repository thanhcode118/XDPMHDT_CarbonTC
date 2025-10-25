using Application.Common.Interfaces;
using Domain.Events.Listing;
using MediatR;

namespace Application.Common.Features.Listings.EventHandlers
{
    public class ListingPurchasedDomainEventHandler : INotificationHandler<ListingPurchasedDomainEvent>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IWalletServiceClient _walletService;
        private readonly IBalanceService _balanceService;

        public ListingPurchasedDomainEventHandler(IUnitOfWork unitOfWork, IWalletServiceClient walletService, IBalanceService balanceService)
        {
            _unitOfWork = unitOfWork;
            _walletService = walletService;
            _balanceService = balanceService;
        }

        public async Task Handle(ListingPurchasedDomainEvent notification, CancellationToken cancellationToken)
        {
            var creditInventory = await _unitOfWork.CreditInventories
                .GetByCreditIdAsync(notification.CreditId, cancellationToken);

            if (creditInventory == null)
                return;

            creditInventory.CommitDirectSale(notification.Amount);

            var transaction = Domain.Entities.Transactions.Create(
                notification.BuyerId,
                notification.OwerId,
                notification.ListingId,
                notification.Amount,
                notification.TotalPrice / notification.Amount
            );

            await _unitOfWork.CreditInventories.UpdateAsync(creditInventory, cancellationToken);
            await _unitOfWork.Transactions.AddAsync(transaction, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            await _walletService.CommitPaymentAsync(
                notification.BuyerId,
                notification.TotalPrice,
                cancellationToken);

            await _balanceService.CommitPurchaseAsync(
                notification.BuyerId,
                notification.TotalPrice);
        }
    }
}
