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
        private readonly IBalanceService _balanceService;

        public BuyNowCommandHandler(IUnitOfWork unitOfWork, IWalletServiceClient walletClient, ICurrentUserService currentUser, IBalanceService balanceService)
        {
            _unitOfWork = unitOfWork;
            _walletClient = walletClient;
            _currentUser = currentUser;
            _balanceService = balanceService;
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


            await _balanceService.WarmUpBalanceAsync(buyerId.Value, null);

            var reserved = await _balanceService.ReserveBalanceForPurchaseAsync(buyerId.Value, totalPrice);
            if (!reserved)
            {
                return Result.Failure(new Error("Wallet", "Insufficient funds (checked via Redis)."));
            }

            try
            {
                
                listing.BuyNow(buyerId.Value, request.Amount);

                await _unitOfWork.SaveChangesAsync(cancellationToken);

                return Result.Success();
            }
            catch (DomainException ex) 
            {
                await _balanceService.ReleaseBalanceForPurchaseAsync(buyerId.Value, totalPrice);
                return Result.Failure(new Error("Listing.Validation", ex.Message));
            }
            catch (Exception ex) 
            {
                await _balanceService.ReleaseBalanceForPurchaseAsync(buyerId.Value, totalPrice);
                return Result.Failure(new Error("Transaction", $"An unexpected error occurred: {ex.Message}"));
            }

/*
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
*/
        }
    }
}
