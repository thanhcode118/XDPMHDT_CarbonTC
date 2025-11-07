using Application.Common.Interfaces;
using Domain.Common.Response;
using Domain.Entities;
using Domain.Enum;
using MediatR;

namespace Application.Common.Features.Listings.Commands.CreateListing
{
    public class CreateListingCommandHandler : IRequestHandler<CreateListingCommand, Result<Guid>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICurrentUserService _currentUser;

        public CreateListingCommandHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUser)
        {
            _unitOfWork = unitOfWork;
            _currentUser = currentUser;
        }

        public async Task<Result<Guid>> Handle(CreateListingCommand command, CancellationToken cancellationToken)
        {
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

            Listing listing = command.Type switch
            {
                ListingType.FixedPrice => Listing.CreateFixedPriceListing(
                    command.CreditId,
                    ownerId,
                    command.PricePerUnit,
                    command.Quantity),

                ListingType.Auction => Listing.CreateAuctionListing(
                    command.CreditId,
                    ownerId,
                    command.PricePerUnit,
                    command.MinimumBid!.Value,
                    command.Quantity,
                    command.AuctionEndTime!.Value),

                _ => throw new InvalidOperationException($"Unsupported listing type: {command.Type}")
            };

            creditInventory.ReserveForListing(command.Quantity);
            await _unitOfWork.Listings.AddAsync(listing, cancellationToken);
            await _unitOfWork.CreditInventories.UpdateAsync(creditInventory, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success(listing.Id);
        }
    }
}
