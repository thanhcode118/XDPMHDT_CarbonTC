using Application.Common.Interfaces;
using Domain.Common.Response;
using Domain.Enum;
using Domain.Exceptions;
using MediatR;

namespace Application.Common.Features.Listings.Commands.BuyNow
{
    public class BuyNowCommandHandler : IRequestHandler<BuyNowCommand, Result>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IWalletServiceClient _walletClient;
        private readonly ICurrentUserService _currentUser;

        public BuyNowCommandHandler(IUnitOfWork unitOfWork, IWalletServiceClient walletClient, ICurrentUserService currentUser)
        {
            _unitOfWork = unitOfWork;
            _walletClient = walletClient;
            _currentUser = currentUser;
        }

        public async Task<Result> Handle(BuyNowCommand request, CancellationToken cancellationToken)
        {
            var listing = await _unitOfWork.Listings.GetByIdAsync(request.ListingId);
            if (listing == null)
            {
                return Result.Failure(new Error("Listing", "Listing not found."));
            }
            if (listing.Type != ListingType.FixedPrice)
                return Result.Failure(new Error("Listing", "This is not a fixed price listing."));
            if (listing.Status != ListingStatus.Open)
                return Result.Failure(new Error("Listing", "This listing is not open for sale."));
            if (listing.Quantity < request.Amount)
                return Result.Failure(new Error("Listing", $"Insufficient quantity. Only {listing.Quantity} is available."));

            var buyerId = _currentUser.UserId;
            if (buyerId is null)
                return Result.Failure(new Error("Authentication", "User is not authenticated."));
            var totalPrice = listing.PricePerUnit * request.Amount;

            var hasEnough = await _walletClient.HasSufficientBalanceAsync(buyerId.Value, totalPrice, cancellationToken);
            if (!hasEnough)
                return Result.Failure(new Error("Wallet", "Insufficient funds."));

            var reserved = await _walletClient.ReserveFundsAsync(buyerId.Value, totalPrice, cancellationToken);
            if (!reserved)
                return Result.Failure(new Error("Wallet", "Unable to reserve funds."));

            var creditInventory = await _unitOfWork.CreditInventories.GetByCreditIdAsync(listing.CreditId, cancellationToken);
            if (creditInventory == null)
            {
                await _walletClient.RollbackReservationAsync(buyerId.Value, totalPrice, cancellationToken);
                return Result.Failure(new Error("CreditInventory", "Credit inventory not found."));
            }

            try
            {
                listing.BuyNow(buyerId.Value, request.Amount);

                await _unitOfWork.Listings.UpdateAsync(listing, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                return Result.Success();
            }
            catch (Exception ex)
            {
                await _walletClient.RollbackReservationAsync(buyerId.Value, totalPrice, cancellationToken);
                return Result.Failure(new Error("Transaction", $"An unexpected error occurred: {ex.Message}"));
            }

        }
    }
}
