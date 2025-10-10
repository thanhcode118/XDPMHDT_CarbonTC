using Domain.Exceptions;
using Domain.Repositories;

namespace Application.Common.Interfaces
{
    public interface IUnitOfWork: IDisposable
    {
        IAuctionBidRepository AuctionBids { get; }
        ICreditInventoryRepository CreditInventories { get; }
        ITransactionsRepository Transactions { get; }
        IListingRepository Listings { get; }
        IPriceSuggestionRepository PriceSuggestions { get; }

        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
        Task BeginTransactionAsync();
        Task CommitTransactionAsync();
        Task RollbackTransactionAsync();
    }
}
