using Application.Common.Interfaces;
using Domain.Common.Response;
using Domain.Enum;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Application.Common.Features.Listings.Commands.FinalizeExpiredAuction
{
    public class FinalizeExpiredAuctionCommandHandler : IRequestHandler<FinalizeExpiredAuctionCommand, Result>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IBalanceService _balanceService;
        private readonly ILogger<FinalizeExpiredAuctionCommandHandler> _logger;

        public FinalizeExpiredAuctionCommandHandler(IUnitOfWork unitOfWork, IBalanceService balanceService, ILogger<FinalizeExpiredAuctionCommandHandler> logger)
        {
            _unitOfWork = unitOfWork;
            _balanceService = balanceService;
            _logger = logger;
        }

        public async Task<Result> Handle(FinalizeExpiredAuctionCommand request, CancellationToken cancellationToken)
        {
            var listing = await _unitOfWork.Listings.GetByIdAsync(request.ListingId, cancellationToken);

            if (listing == null)
                return Result.Failure(new Error("Listing.NotFound", "The specified listing was not found."));

            if (listing.Status != ListingStatus.Open)
                return Result.Failure(new Error("Listing.NotOpen", "This listing is not currently open."));

            if (listing.AuctionEndTime > DateTime.UtcNow)
                return Result.Failure(new Error("Listing.NotExpired", "This listing has not expired yet."));

            var winnerBid = listing.Bids
                                 .Where(b => b.Status == BidStatus.Winning)
                                 .OrderByDescending(b => b.BidAmount)
                                 .FirstOrDefault();

            if (winnerBid != null)
            {
                _logger.LogInformation("Committing balance for winner {WinnerId} on auction {ListingId}", winnerBid.BidderId, listing.Id);
                await _balanceService.CommitBalanceForAuctionAsync(winnerBid.BidderId, winnerBid.ListingId);
            }
            else
            {
                _logger.LogInformation("Closing auction {ListingId} with no winner.", listing.Id);
            }

            listing.CompleteAuction(); 
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success();
        }
    }
}
