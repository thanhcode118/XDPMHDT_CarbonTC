using Domain.Entities;
using Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data.Repositories
{
    public class AuctionBidRepository : IAuctionBidRepository
    {
        private readonly ApplicationDbContext _dbContext;

        public AuctionBidRepository(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<AuctionBid> AddAsync(AuctionBid auctionBid, CancellationToken cancellationToken = default)
        {
            await _dbContext.AuctionBids.AddAsync(auctionBid, cancellationToken);
            return auctionBid;
        }

        public async Task<List<AuctionBid?>> GetBidsByListingAsync(Guid listingId)
        {
            var auctionBids = await _dbContext.AuctionBids.Where(b => b.ListingId == listingId).ToListAsync();
            return auctionBids;
        }

        public async Task<AuctionBid?> GetHighestBidAsync(Guid listingId)
        {
            var highestBid = await _dbContext.AuctionBids
                .Where(b => b.ListingId == listingId)
                .OrderByDescending(b => b.BidAmount)
                .FirstOrDefaultAsync();
            return highestBid;
        }

        public async Task<List<AuctionBid?>> GetUserBidsAsync(Guid userId)
        {
            var userBids = await _dbContext.AuctionBids.Where(b => b.BidderId == userId).ToListAsync();
            return userBids;
        }

        public Task UpdateAsync(AuctionBid bid, CancellationToken cancellationToken = default)
        {
            _dbContext.AuctionBids.Update(bid);
            return Task.CompletedTask;
        }


    }
}
