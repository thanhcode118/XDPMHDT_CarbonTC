using Application.Common.Interfaces;
using Domain.Repositories;
using Infrastructure.Data.Repositories;
using Microsoft.EntityFrameworkCore.Storage;

namespace Infrastructure
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly ApplicationDbContext _context;

        private IDbContextTransaction? _transaction;
        public IAuctionBidRepository AuctionBids { get; }

        public ICreditInventoryRepository CreditInventories { get; }

        public ITransactionsRepository Transactions { get; }

        public IListingRepository Listings { get; }

        public IPriceSuggestionRepository PriceSuggestions { get; }

        public UnitOfWork(ApplicationDbContext context)
        {
            _context = context;
            Listings = new ListingRepository(_context);
            PriceSuggestions = new PriceSuggestionRepository(_context);
            Transactions = new TransactionsRepository(_context);
            AuctionBids = new AuctionBidRepository(_context);
            CreditInventories = new CreditInventoryRepository(_context);
        }


        public async Task BeginTransactionAsync()
        {
            _transaction = await _context.Database.BeginTransactionAsync();
        }

        public async Task CommitTransactionAsync()
        {
            if (_transaction != null)
            {
                await _transaction.CommitAsync();
                await _transaction.DisposeAsync();
                _transaction = null;
            }
        }

        public void Dispose()
        {
            _transaction?.Dispose();
            _context.Dispose();
        }

        public async Task RollbackTransactionAsync()
        {
            if (_transaction != null)
            {
                await _transaction.RollbackAsync();
                await _transaction.DisposeAsync();
                _transaction = null;
            }
        }

        public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            return await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
