using Application.Common.Interfaces;
using Domain.Common.Response;
using Domain.Entities;
using MediatR;

namespace Application.Common.Features.CreditInventories.Queries.GetCreditInventoryByCreditId
{
    public class GetCreditInventoryByCreditIdQueryHandler : IRequestHandler<GetCreditInventoryByCreditIdQuery, Result<CreditInventory>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public GetCreditInventoryByCreditIdQueryHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<CreditInventory>> Handle(GetCreditInventoryByCreditIdQuery request, CancellationToken cancellationToken)
        {
            var creditInventory = await _unitOfWork.CreditInventories.GetByCreditIdAsync(request.CreditId, cancellationToken);
            if (creditInventory == null)
            {
                return Result.Failure<CreditInventory>(new Error("CreditInventory", "Credit inventory not found."));
            }
            return Result.Success(creditInventory);
        }
    }
}
