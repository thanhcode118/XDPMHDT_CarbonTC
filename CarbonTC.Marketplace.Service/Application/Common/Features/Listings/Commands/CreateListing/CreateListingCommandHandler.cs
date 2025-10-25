using Application.Common.Interfaces;
using Domain.Common.Response;
using Domain.Entities;
using Domain.Enum;
using Domain.Repositories;
using MediatR;

namespace Application.Common.Features.Listings.Commands.CreateListing
{
    public class CreateListingCommandHandler : IRequestHandler<CreateListingCommand, Result<Guid>>
    {
        private readonly IListingRepository _listingRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICurrentUserService _currentUser;

        public CreateListingCommandHandler(IListingRepository listingRepository, IUnitOfWork unitOfWork, ICurrentUserService currentUser)
        {
            _listingRepository = listingRepository;
            _unitOfWork = unitOfWork;
            _currentUser = currentUser;
        }

        public async Task<Result<Guid>> Handle(CreateListingCommand command, CancellationToken cancellationToken)
        {
            Listing listing;
            if (_currentUser.UserId is not Guid ownerId)
            {
                return Result.Failure<Guid>(new Error("User.Unauthorized", "Please login to create"));
            }

            var creditInventory = await _unitOfWork.CreditInventories.GetByCreditIdAsync(command.CreditId, cancellationToken);
            if (creditInventory == null)
            {
                return Result.Failure<Guid>(new Error("CreditInventory", "Credit inventory not found."));
            }

            if (command.Quantity > creditInventory.AvailableAmount)
                return Result.Failure<Guid>(new Error("CreditInventory", $"Credit inventory only {creditInventory.AvailableAmount} left"));

            switch (command.Type)
            {
                case ListingType.FixedPrice:
                    listing = Listing.CreateFixedPriceListing(
                        command.CreditId,
                        ownerId,
                        command.PricePerUnit,
                        command.Quantity);
                    break;

                case ListingType.Auction:
                    listing = Listing.CreateAuctionListing(
                        command.CreditId,
                        ownerId,
                        command.PricePerUnit,
                        command.MinimumBid.Value,
                        command.Quantity,
                        command.AuctionEndTime.Value);
                    break;
                default:
                    return Result.Failure<Guid>(new Error("Listing.Type", "Unsupported listing type provided."));
            }

            creditInventory.ReserveForListing(command.Quantity);
            await _unitOfWork.Listings.AddAsync(listing);
            await _unitOfWork.CreditInventories.UpdateAsync(creditInventory);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success(listing.Id);
        }
    }
}
