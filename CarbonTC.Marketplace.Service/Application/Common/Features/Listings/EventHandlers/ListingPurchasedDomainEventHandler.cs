using Application.Common.DTOs;
using Application.Common.Interfaces;
using Domain.Events.Listing;
using MediatR;

namespace Application.Common.Features.Listings.EventHandlers
{
    public class ListingPurchasedDomainEventHandler : INotificationHandler<ListingPurchasedDomainEvent>
    {
        private readonly IUnitOfWork _unitOfWork;

        public ListingPurchasedDomainEventHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
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

            var transactionWalletDto = new TransactionWalletDto
            {
                TransactionId = transaction.Id.ToString(),
                BuyerUserId = transaction.BuyerId.ToString(),
                SellerUserId = transaction.SellerId.ToString(),
                MoneyAmount = notification.TotalPrice,
                CreditAmount = notification.Amount,
                PlatformFee = CalculatePlatformFee(notification.TotalPrice),
                CreatedAt = transaction.CreatedAt.ToString("o")
            };

            await _unitOfWork.CreditInventories.UpdateAsync(creditInventory, cancellationToken);
            await _unitOfWork.Transactions.AddAsync(transaction, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }

        private decimal CalculatePlatformFee(decimal moneyAmount, decimal percentage = 0.02m)
        {
            return moneyAmount * percentage;
        }
    }
}
