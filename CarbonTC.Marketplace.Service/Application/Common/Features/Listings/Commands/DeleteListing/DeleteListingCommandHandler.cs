using Application.Common.Interfaces;
using Domain.Common.Response;
using MediatR;

namespace Application.Common.Features.Listings.Commands.DeleteListing
{
    public class DeleteListingCommandHandler: IRequestHandler<DeleteListingCommand, Result>   
    {
        private readonly IUnitOfWork _unitOfWork;

        public DeleteListingCommandHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        
        public async Task<Result> Handle(DeleteListingCommand request, CancellationToken cancellationToken)
        {
            var listing = await _unitOfWork.Listings.GetByIdAsync(request.ListingId, cancellationToken);

            if (listing == null)
                return Result.Failure(new Error("Listing.NotFound", $"Listing with ID {request.ListingId} not found."));

            var haverAnyTransactions = await _unitOfWork.Transactions.GetAllByListingIdAsync(request.ListingId, cancellationToken);

            if (haverAnyTransactions.Any())
                return Result.Failure(new Error("Listing.HasTransactions", "Cannot delete listing that has associated transactions."));

            await _unitOfWork.Listings.DeleteAsync(listing, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success();
        }
    }
}
