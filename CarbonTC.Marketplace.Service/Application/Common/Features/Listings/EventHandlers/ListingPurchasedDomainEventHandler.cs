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
            // Thêm tracstions, Trừ inventory
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
        }
    }
}
