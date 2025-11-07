using Application.Common.Interfaces;
using MediatR;

namespace Application.Common.Features.Listings.Commands.WarmUpUserBalance
{
    public class WarmUpUserBalanceCommandHandler : IRequestHandler<WarmUpUserBalanceCommand>
    {
        private readonly IBalanceService _balanceService;

        public WarmUpUserBalanceCommandHandler(IBalanceService balanceService)
        {
            _balanceService = balanceService;
        }

        public async Task Handle(WarmUpUserBalanceCommand request, CancellationToken cancellationToken)
        {
            await _balanceService.WarmUpBalanceAsync(request.UserId);
        }
    }
}
