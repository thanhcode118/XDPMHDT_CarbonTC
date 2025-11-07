using Application.Common.DTOs;
using Application.Common.Interfaces;
using Domain.Common.Response;
using Domain.Enum;
using Domain.Exceptions;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Application.Common.Features.Listings.Commands.Auctions
{
    internal class AuctionCommandHandler : IRequestHandler<AuctionCommand ,Result<AuctionBidResponse>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICurrentUserService _currentUser;
        private readonly IBalanceService _balanceService;
        private readonly ICacheService _cacheService;
        private readonly ILogger<AuctionCommandHandler> _logger;

        public AuctionCommandHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUser, IBalanceService balanceService, ICacheService cacheService, ILogger<AuctionCommandHandler> logger)
        {
            _unitOfWork = unitOfWork;
            _currentUser = currentUser;
            _balanceService = balanceService;
            _cacheService = cacheService;
            _logger = logger;
        }

        public async Task<Result<AuctionBidResponse>> Handle(AuctionCommand request, CancellationToken cancellationToken)
        {
            if (!_currentUser.UserId.HasValue || _currentUser.UserId.Value == Guid.Empty)
            {
                return Result<AuctionBidResponse>.Failure<AuctionBidResponse>(
                    new Error("Authentication", "User is not authenticated."));
            }

            var userId = _currentUser.UserId.Value;

            // 1. Authentication check
            if (userId == Guid.Empty)
            {
                return Result<AuctionBidResponse>.Failure<AuctionBidResponse>(new Error("Authentication", "User is not authenticated."));
            }

            // 2. Get listing
            var listing = await _unitOfWork.Listings.GetByIdAsync(request.ListingId, cancellationToken);
            if (listing == null)
            {
                return Result<AuctionBidResponse>.Failure<AuctionBidResponse>(new Error("Listing", "Listing not found."));
            }

            // 3. Warm up balance with error handling
            var warmupSuccess = await _balanceService.WarmUpBalanceAsync(userId, listing.AuctionEndTime);
            if (!warmupSuccess)
            {
                return Result<AuctionBidResponse>.Failure<AuctionBidResponse>(new Error(
                    "Balance",
                    "Unable to verify balance. Please try again later."));
            }

            // 4. Reserve balance atomically
            var reserved = await _balanceService.ReserveBalanceForAuctionAsync(
                userId,
                request.ListingId,
                request.BidAmount);

            if (!reserved)
            {
                var balance = await _balanceService.GetBalanceAsync(userId);
                var currentLocked = await _balanceService.GetAuctionLockedAmountAsync(userId, request.ListingId);

                return Result<AuctionBidResponse>.Failure<AuctionBidResponse>(new Error(
                    "InsufficientBalance",
                    $"Insufficient balance. Available: {balance.available:N0}, " +
                    $"Currently locked for this auction: {currentLocked:N0}, " +
                    $"Required total: {request.BidAmount:N0}"));
            }

            // 5. Acquire distributed lock for this auction
            var lockKey = $"auction_lock:{request.ListingId}";
            var lockValue = Guid.NewGuid().ToString();
            var lockAcquired = await _cacheService.AcquireLockAsync(
                lockKey,
                lockValue,
                TimeSpan.FromSeconds(5));

            if (!lockAcquired)
            {
                // Release reserved balance before failing
                await _balanceService.ReleaseBalanceForAuctionAsync(userId, request.ListingId);
                return Result<AuctionBidResponse>.Failure<AuctionBidResponse>(new Error(
                    "Concurrency",
                    "Another bid is being processed. Please try again."));
            }

            try
            {
                // 6. Place bid in domain (will throw DomainException if invalid)
                var previousHighestBid = listing.Bids
                    .Where(b => b.Status == BidStatus.Winning)
                    .OrderByDescending(b => b.BidAmount)
                    .FirstOrDefault();

                var previousWinnerId = previousHighestBid?.BidderId;

                // Domain method handles all business validations
                var newBid = listing.PlaceBid(userId, request.BidAmount);


                // 7. Save changes to database
                await _unitOfWork.Listings.UpdateAsync(listing, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                // 8. Release balance of previous winner AFTER successful commit
                if (previousWinnerId.HasValue &&
                    previousHighestBid != null &&
                    previousWinnerId.Value != userId)
                {
                    try
                    {
                        await _balanceService.ReleaseBalanceForAuctionAsync(
                            previousWinnerId.Value,
                            request.ListingId);
                    }
                    catch (Exception ex)
                    {
                        // Log but don't fail - transaction already committed
                        // Previous winner's balance will be released when auction ends
                        _logger.LogError(ex,
                            "Failed to release balance for previous winner {UserId} on listing {ListingId}",
                            previousWinnerId.Value,
                            request.ListingId);
                    }
                }

                // 9. Return success response
                return Result<AuctionBidResponse>.Success( new AuctionBidResponse
                {
                    BidId = newBid.Id,
                    ListingId = newBid.ListingId,
                    BidderId = newBid.BidderId,
                    BidAmount = newBid.BidAmount,
                    BidTime = newBid.BidTime,
                    Status = newBid.Status.ToString(),
                    Message = $"Bid placed successfully: {request.BidAmount:N0}"
                });
            }
            catch (DomainException ex)
            {
                // Rollback balance reservation
                await _balanceService.ReleaseBalanceForAuctionAsync(userId, request.ListingId);

                return Result<AuctionBidResponse>.Failure<AuctionBidResponse>(new Error("Bid", ex.Message));
            }
            catch (Exception ex)
            {
                // Rollback balance reservation
                await _balanceService.ReleaseBalanceForAuctionAsync(userId, request.ListingId);

                _logger.LogError(ex,
                    "Unexpected error placing bid for user {UserId} on listing {ListingId}",
                    userId,
                    request.ListingId);

                return Result<AuctionBidResponse>.Failure<AuctionBidResponse>(new Error(
                    "Bid",
                    "An unexpected error occurred while placing bid. Please try again."));
            }
            finally
            {
                // Always release the lock
                try
                {
                    await _cacheService.ReleaseLockAsync(lockKey, lockValue);
                }
                catch (Exception ex)
                {
                    // Log but don't throw - lock will expire automatically
                    _logger.LogError(ex, "Failed to release lock {LockKey}", lockKey);
                }
            }
        }
    }
}
