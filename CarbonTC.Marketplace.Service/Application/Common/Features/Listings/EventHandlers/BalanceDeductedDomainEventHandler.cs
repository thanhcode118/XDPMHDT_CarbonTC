using Application.Common.Interfaces;
using Domain.Events.Listing;
using MediatR;

namespace Application.Common.Features.Listings.EventHandlers
{
    public class BalanceDeductedDomainEventHandler : INotificationHandler<BalanceDeductedDomainEvent>
    {
        private readonly IBalanceService _balanceService;

        public BalanceDeductedDomainEventHandler(IBalanceService balanceService)
        {
            _balanceService = balanceService;
        }

        public async Task Handle(BalanceDeductedDomainEvent notification, CancellationToken cancellationToken)
        {
            // chung 111

            //await _balanceService.CommitPurchaseAsync(
            //    notification.BuyerId,
            //    notification.TotalPrice);
        }
    }
}
