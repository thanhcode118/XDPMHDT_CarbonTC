using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace Application.Common.Interfaces
{
    public interface IApplicationDbContext
    {
        public DbSet<Listing> Listings { get; set; } 
        public DbSet<AuctionBid> AuctionBids { get; set; } 
        public DbSet<PriceSuggestion> PriceSuggestions { get; set; } 
        public DbSet<Transactions> Transactions { get; set; } 
        public DbSet<CreditInventory> CreditInventories { get; set; }

        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
