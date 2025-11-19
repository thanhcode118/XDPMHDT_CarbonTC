using Application.Common.Interfaces;
using Domain.Common.Response;
using Domain.Enum;
using MediatR;

namespace Application.Common.Features.Transactions.Commands
{
    internal class TransactionCompletedCommandHandler : IRequestHandler<TransactionCompletedCommand, Result>
    {
        private readonly IUnitOfWork _unitOfWork;

        public TransactionCompletedCommandHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result> Handle(TransactionCompletedCommand request, CancellationToken cancellationToken)
        {
            if (!Guid.TryParse(request.TransactionId, out Guid transactionGuid))
            {
                return Result.Failure(new Error("InvalidFormat", "Transaction ID has invalid format"));
            }

            var transaction = await _unitOfWork.Transactions.GetByIdAsync(transactionGuid, cancellationToken);

            if (transaction == null)
            {
                return Result.Failure(Error.NullValue);
            }

            if (transaction.Status != TransactionStatus.Pending)
            {
                return Result.Success();
            }

            var listing = await _unitOfWork.Listings.GetByIdAsync(transaction.ListingId, cancellationToken);
            if (listing == null)
            {
                return Result.Failure(new Error("Listing.NotFound", "Listing not found associated with transaction"));
            }

            var creditInventory = await _unitOfWork.CreditInventories.GetByCreditIdAsync(listing.CreditId, cancellationToken);
            if (creditInventory == null)
            {
                return Result.Failure(new Error("Inventory.NotFound", "Seller inventory not found"));
            }

            if (request.Status == "COMPLETED")
            {
                transaction.MarkAsSuccess();
                creditInventory.CompleteTransaction(transaction.Quantity);
            }

            else if (request.Status == "FAILED")
            {
                transaction.MarkAsFailed(request.Message ?? "UNAFFORDABLE");

                if(listing.Type == ListingType.FixedPrice)
                {
                    creditInventory.RollbackToListed(transaction.Quantity);
                    listing.RollbackQuantity(transaction.Quantity);
                }
                else
                {
                    creditInventory.RollbackToAvailable(transaction.Quantity);
                }
            }
            else
            {
                return Result.Failure(new Error("InvalidStatus", $"Unknown status: {request.Status}"));
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return Result.Success();
        }
    }
}
