using Application.Common.Interfaces;
using Domain.Common.Response;
using Domain.Entities;
using Domain.Enum;
using MediatR;

namespace Application.Common.Features.Listings.Commands.UpdateListing
{
    public class UpdateListingCommandHandler : IRequestHandler<UpdateListingCommand, Result>
    {
        private readonly IUnitOfWork _unitOfWork;

        public UpdateListingCommandHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result> Handle(UpdateListingCommand request, CancellationToken cancellationToken)
        {
            var listing =await _unitOfWork.Listings.GetByIdAsync(request.ListingId);
            if (listing == null)
            {
                return Result.Failure(new Error("LISTING_NOT_FOUND", "Listing not found"));
            }

            if(listing.Type == ListingType.Auction && listing.HasBids())
            {
                return Result.Failure(new Error("AUCTION_HAS_ACTIVE_BIDS", "Cannot update auction listing that has active bids. Please cancel the listing instead."));
            }

            var validationResult = ValidateBusinessRules(listing, request);
            if (validationResult.IsFailure)
                return Result.Failure(validationResult.Error);

            UpdateListingProperties(listing, request);

            await _unitOfWork.Listings.UpdateAsync(listing, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success(listing.Id);
        }

        private Result ValidateBusinessRules(Listing listing, UpdateListingCommand request)
        {
            if (listing.Status == ListingStatus.Sold || listing.Status == ListingStatus.Cancelled)
                return Result.Failure(new Error("LISTING_IMMUTABLE", "Cannot modify sold or cancelled listings"));

            /*
            if (listing.Type == ListingType.FixedPrice && request.Type == ListingType.Auction && listing.Status == ListingStatus.Open)
                return Result.Failure(new Error("CANNOT_CONVERT_TO_AUCTION", "Cannot convert fixed price listing to auction while it's open"));
            */
            return Result.Success();
        }

        private void UpdateListingProperties(Listing listing, UpdateListingCommand request)
        {
            if (listing.Type != request.Type)
            {
                listing.UpdateType(request.Type);
            }

            listing.UpdateStatus(request.Status);

            if (request.Type == ListingType.FixedPrice)
            {
                listing.UpdateFixedPrice(request.PricePerUnit);
            }
            else if (request.Type == ListingType.Auction)
            {
                listing.UpdateAuctionDetails(
                    request.MinimumBid!.Value,
                    request.AuctionEndTime!.Value
                );
            }

            //listing.AddDomainEvent(new ListingUpdatedDomainEvent(listing.Id, DateTime.UtcNow));
        }
    }
}
