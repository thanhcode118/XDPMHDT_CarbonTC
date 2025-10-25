using Application.Common.Interfaces;
using Domain.Common.Response;
using MediatR;

namespace Application.Common.Features.Listings.Commands.DeleteListing
{
    public class DeleteListingCommandHandler: IRequestHandler<DeleteListingCommand, Result>   
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICurrentUserService _currentUser;

        public DeleteListingCommandHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUser)
        {
            _unitOfWork = unitOfWork;
            _currentUser = currentUser;
        }
        
        public async Task<Result> Handle(DeleteListingCommand request, CancellationToken cancellationToken)
        {
            var listing = await _unitOfWork.Listings.GetByIdAsync(request.ListingId, cancellationToken);

            if (listing == null)
                return Result.Failure(new Error("Listing.NotFound", $"Listing with ID {request.ListingId} not found."));
            if (listing.OwnerId != _currentUser.UserId)
                return Result.Failure(new Error("Listing.Unauthorized", "You are not authorized to delete this listing."));
            if (listing.Bids.Any())
                return Result.Failure(new Error("Listing.HasBids", "Cannot delete listing that has associated bids."));

            var haverAnyTransactions = await _unitOfWork.Transactions.GetAllByListingIdAsync(request.ListingId, cancellationToken);

            if (haverAnyTransactions.Any())
                return Result.Failure(new Error("Listing.HasTransactions", "Cannot delete listing that has associated transactions."));

            var creditInventory = await _unitOfWork.CreditInventories.GetByCreditIdAsync(request.ListingId, cancellationToken);
            if(creditInventory != null)
            {
                creditInventory.ReleaseFromListing(listing.Quantity);
            }

            await _unitOfWork.Listings.DeleteAsync(listing, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success();
        }
    }
}
