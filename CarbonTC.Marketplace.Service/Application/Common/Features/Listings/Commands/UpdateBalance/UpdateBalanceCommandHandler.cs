using Application.Common.Interfaces;
using Domain.Common.Response;
using MediatR;

namespace Application.Common.Features.Listings.Commands.UpdateBalance
{
    public class UpdateBalanceCommandHandler : IRequestHandler<UpdateBalanceCommand, Result>
    {
        private readonly IBalanceService _balanceService;

        public UpdateBalanceCommandHandler(IBalanceService  balanceService)
        {
            _balanceService = balanceService;
        }

        public async Task<Result> Handle(UpdateBalanceCommand request, CancellationToken cancellationToken)
        {
            var wasSuccessful = await _balanceService.UpdateBalanceAfterDepositOrWithdrawAsync(request.UserId, request.NewTotalBalance);

            if (!wasSuccessful)
            {
                return Result.Failure(new Error("Balance.UpdateFailed", "Failed to update balance."));
            }

            return Result.Success();
        }
    }
}
