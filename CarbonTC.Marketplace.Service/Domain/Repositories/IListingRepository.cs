using Domain.Entities;
using System.Linq.Expressions;

namespace Domain.Repositories
{
    public interface IListingRepository
    {
        Task<Listing?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
        Task<Listing?> GetByIdWithCreditAsync(Guid id, CancellationToken cancellationToken = default);
        //Task<PagedResult<Listing?>> SearchAsync(ListingSearchQuery query, CancellationToken cancellationToken = default);
        Task<List<Listing?>> GetUserListingsAsync(Guid userId, CancellationToken cancellationToken = default);
        Task<Listing> AddAsync(Listing listing, CancellationToken cancellationToken = default);
        Task UpdateAsync(Listing listing, CancellationToken cancellationToken = default);
        Task<bool> ExistsAsync(Guid id, CancellationToken cancellationToken = default);
        Task DeleteAsync(Listing listing, CancellationToken cancellationToken = default);
        Task<IEnumerable<Listing?>> FindAsync(Expression<Func<Listing, bool>> predicate,
            CancellationToken cancellationToken = default);
    }
}
