using Application.Common.Interfaces;
using Domain.Common.Response;
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

            var transaction = await _unitOfWork.Transactions.GetByIdAsync(transactionGuid);

            if (transaction == null)
            {
                return Result.Failure(Error.NullValue);
            }

            if (request.Status == "COMPLETED")
            {
                transaction.MarkAsSuccess();
            }

            else if (request.Status == "FAILED")
            {
                transaction.MarkAsFailed(request.Message == null ? "UNAFFORDABLE" : request.Message);
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return Result.Success();
        }
    }
}
