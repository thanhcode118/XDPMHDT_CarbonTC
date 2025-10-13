using Application.Common.Interfaces;
using Domain.Common.Response;
using Domain.Entities;
using MediatR;

namespace Application.Common.Features.CreditInventories.Commands.CreateCreditInventory
{
    public class CreateCreditInventoryHandler : IRequestHandler<CreateCreditInventoryCommand, Result<Guid>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public CreateCreditInventoryHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<Guid>> Handle(CreateCreditInventoryCommand request, CancellationToken cancellationToken)
        {
            CreditInventory inventory;

            var isExisting =_unitOfWork.CreditInventories.GetByCreditIdAsync(request.CreditId, cancellationToken);

            if (isExisting != null)
            {
                return Result.Failure<Guid>(new Error("CreditInventory", "Credit inventory already exists for this credit ID."));
            }

            inventory = CreditInventory.Create(request.CreditId, request.TotalAmount);

            await _unitOfWork.CreditInventories.AddAsync(inventory, cancellationToken);

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result<Guid>.Success(inventory.Id);
        }
    }
}
