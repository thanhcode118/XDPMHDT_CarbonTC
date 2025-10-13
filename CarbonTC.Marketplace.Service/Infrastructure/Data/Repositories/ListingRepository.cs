using Domain.Entities;
using Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data.Repositories
{
    public class ListingRepository : IListingRepository
    {
        private readonly ApplicationDbContext _dbContext;

        public ListingRepository(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }
        public async Task<Listing> AddAsync(Listing listing, CancellationToken cancellationToken = default)
        {
            await _dbContext.Listings.AddAsync(listing);
            return listing;
        }

        public async Task DeleteAsync(Listing listing, CancellationToken cancellationToken = default)
        {
            _dbContext.Listings.Remove(listing);
            await Task.CompletedTask;
        }

        public Task<bool> ExistsAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var exists = _dbContext.Listings.AnyAsync(l => l.Id == id);
            return exists;
        }

        public async Task<Listing?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var listing = await _dbContext.Listings
                .Include(l => l.Bids)
                .Include(l => l.PriceSuggestion)
                .FirstOrDefaultAsync(l => l.Id == id, cancellationToken);
            return listing;
        }

        public async Task<Listing?> GetByIdWithCreditAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var listing = await _dbContext.Listings
                .Include(l => l.PriceSuggestion)
                .Include(l => l.Bids)
                .FirstOrDefaultAsync(l => l.CreditId == id);
            return listing;
        }

        public async Task<List<Listing?>> GetUserListingsAsync(Guid userId, CancellationToken cancellationToken = default)
        {
            var listings = await _dbContext.Listings
                .Include(l => l.PriceSuggestion)
                .Include(l => l.Bids)
                .Where(l => l.OwnerId == userId).ToListAsync();
            return listings;
        }

        public async Task UpdateAsync(Listing listing, CancellationToken cancellationToken = default)
        {
            _dbContext.Listings.Update(listing);
            await Task.CompletedTask;
        }
    }
}
