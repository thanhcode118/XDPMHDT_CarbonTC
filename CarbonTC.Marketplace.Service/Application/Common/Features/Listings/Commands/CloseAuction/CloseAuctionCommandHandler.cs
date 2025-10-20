using Application.Common.Interfaces;
using Domain.Enum;
using MediatR;

namespace Application.Common.Features.Listings.Commands.CloseAuction
{
    public class CloseAuctionCommandHandler : IRequestHandler<CloseAuctionCommand>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IBalanceService _balanceService;

        public CloseAuctionCommandHandler(IUnitOfWork unitOfWork, IBalanceService balanceService)
        {
            _unitOfWork = unitOfWork;
            _balanceService = balanceService;
        }

        public async Task Handle(CloseAuctionCommand request, CancellationToken cancellationToken)
        {
            var listing = await _unitOfWork.Listings.GetByIdAsync(request.ListingId, cancellationToken);
            if (listing == null || listing.Status == ListingStatus.Closed) return;

            var winnerBid = listing.Bids.OrderByDescending(b => b.BidAmount).FirstOrDefault();
            if (winnerBid != null)
            {
                await _balanceService.CommitBalanceForAuctionAsync(winnerBid.BidderId, winnerBid.ListingId);
            }

            listing.CompleteAuction();

            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}
