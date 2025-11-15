using Application.Common.Interfaces;
using Domain.Common.Response;
using MediatR;

namespace Application.Common.Features.Listings.Queries.CanWithdraw
{
    public class CanWithdrawQueryHandler : IRequestHandler<CanWithdrawQuery, Result<bool>>
    {
        private readonly IBalanceService _balanceService;

        public CanWithdrawQueryHandler(IBalanceService balanceService)
        {
            _balanceService = balanceService;
        }

        public async Task<Result<bool>> Handle(CanWithdrawQuery request, CancellationToken cancellationToken)
        {
            var canWithdraw =  await _balanceService.CanWithdrawAsync(request.userId, request.amountToWithdraw);
            return Result.Success(canWithdraw);
        }
    }
}
