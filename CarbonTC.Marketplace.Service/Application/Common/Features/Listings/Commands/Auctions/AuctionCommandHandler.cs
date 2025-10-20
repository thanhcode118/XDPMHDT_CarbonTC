using Application.Common.Interfaces;
using Domain.Common.Response;
using Domain.Enum;
using Domain.Exceptions;
using MediatR;
using System.Security.Cryptography;

namespace Application.Common.Features.Listings.Commands.Auctions
{
    internal class AuctionCommandHandler : IRequestHandler<AuctionCommand ,Result<Object>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICurrentUserService _currentUser;
        private readonly IBalanceService _balanceService;
        private readonly ICacheService _cacheService;

        public AuctionCommandHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUser, IBalanceService balanceService, ICacheService cacheService)
        {
            _unitOfWork = unitOfWork;
            _currentUser = currentUser;
            _balanceService = balanceService;
            _cacheService = cacheService;
        }

        public async Task<Result<Object>> Handle(AuctionCommand request, CancellationToken cancellationToken)
        {
            var userId = _currentUser.UserId!.Value;

            // 1. Authentication check
            if (userId == Guid.Empty)
            {
                return Result<Object>.Failure(new Error("Authentication", "User is not authenticated."));
            }

            // 2. Get listing info
            var listing = await _unitOfWork.Listings.GetByIdAsync(request.ListingId, cancellationToken);
            if (listing == null)
            {
                return Result<Object>.Failure(new Error("Listing", "Listing not found."));
            }

            // 3. Warm up balance if not in Redis
            await _balanceService.WarmUpBalanceAsync(userId, listing.AuctionEndTime);

            // 4. Get current user's bid on this listing (from domain)
            var currentUserBid = listing.Bids
                .Where(b => b.BidderId == userId)
                .OrderByDescending(b => b.BidAmount)
                .FirstOrDefault();

            // 5. Get current highest bid
            var currentHighestBid = listing.Bids
                .Where(b => b.Status == BidStatus.Winning)
                .OrderByDescending(b => b.BidAmount)
                .FirstOrDefault();

            // 6. Validation: Check if user is already highest bidder
            if (currentHighestBid?.BidderId == userId)
            {
                return Result<Object>.Failure(new Error("Bid", "You are already the highest bidder"));
            }

            // 7. Validation: If user has bid before, new bid must be higher
            if (currentUserBid != null && request.BidAmount <= currentUserBid.BidAmount)
            {
                return Result<Object>.Failure(
                    new Error("Bid", $"New bid must be higher than your current bid of {currentUserBid.BidAmount}"));
            }


            // 8. ATOMIC RESERVE: Reserve balance for this specific auction
            //    This handles BOTH first-time bid AND raise-bid scenarios
            var reserved = await _balanceService.ReserveBalanceForAuctionAsync(
                userId,
                request.ListingId,
                request.BidAmount);

            if (!reserved)
            {
                var balance = await _balanceService.GetBalanceAsync(userId);
                var currentLocked = await _balanceService.GetAuctionLockedAmountAsync(userId, request.ListingId);

                return Result<Object>.Failure(new Error(
                    "InsufficientBalance",
                    $"Insufficient balance. Available: {balance.available:N0}, " +
                    $"Currently locked for this auction: {currentLocked:N0}, " +
                    $"Required total: {request.BidAmount:N0}"));
            }

            try
            {
                // 9. Place bid in domain (will throw DomainException if invalid)
                var previousWinnerId = currentHighestBid?.BidderId;
                var newBid = listing.PlaceBid(userId, request.BidAmount);

                // 10. Release balance of previous winner (if exists and not current user)
                if (previousWinnerId.HasValue &&
                    currentHighestBid != null &&
                    previousWinnerId.Value != userId)
                {
                    await _balanceService.ReleaseBalanceForAuctionAsync(
                        previousWinnerId.Value,
                        request.ListingId);
                }

                // 11. Save changes
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                return Result<Object>.Success(new
                {
                    bid = newBid,
                    message = currentUserBid != null
                        ? $"Bid raised from {currentUserBid.BidAmount:N0} to {request.BidAmount:N0}"
                        : $"Bid placed: {request.BidAmount:N0}"
                });
            }
            catch (DomainException ex)
            {
                await _balanceService.ReleaseBalanceForAuctionAsync(userId, request.ListingId);

                return Result<Object>.Failure(new Error("Bid", ex.Message));
            }
            catch (Exception ex)
            {
                await _balanceService.ReleaseBalanceForAuctionAsync(userId, request.ListingId);

                return Result<Object>.Failure(new Error("Bid", "An unexpected error occurred while placing bid."));
            }
        }
    }
}
