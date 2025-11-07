using Domain.Entities;

namespace Domain.Repositories
{
    public interface IAuctionBidRepository
    {
        Task<AuctionBid> AddAsync(AuctionBid auctionBid, CancellationToken cancellationToken = default);

        Task UpdateAsync(AuctionBid bid, CancellationToken cancellationToken = default);
        Task<AuctionBid?> GetHighestBidAsync(Guid listingId);
        Task<List<AuctionBid?>> GetBidsByListingAsync(Guid listingId);
        Task<List<AuctionBid?>> GetUserBidsAsync(Guid userId);
    }
}
