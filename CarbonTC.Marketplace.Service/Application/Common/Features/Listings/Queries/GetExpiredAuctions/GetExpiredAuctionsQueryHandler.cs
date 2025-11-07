using Application.Common.Interfaces;
using Domain.Common.Response;
using Domain.Entities;
using Domain.Enum;
using MediatR;

namespace Application.Common.Features.Listings.Queries.GetExpiredAuctions
{
    public class GetExpiredAuctionsQueryHandler : IRequestHandler<GetExpiredAuctionsQuery, List<Listing>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public GetExpiredAuctionsQueryHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<List<Listing?>> Handle(GetExpiredAuctionsQuery request, CancellationToken cancellationToken)
        {
            var now = DateTime.UtcNow;
            var expiredListings = await _unitOfWork.Listings.FindAsync(
                l => l.Type == ListingType.Auction &&
                     l.Status == ListingStatus.Open &&
                     l.AuctionEndTime <= now,
                cancellationToken);
            return expiredListings.ToList();
        }
    }
}
