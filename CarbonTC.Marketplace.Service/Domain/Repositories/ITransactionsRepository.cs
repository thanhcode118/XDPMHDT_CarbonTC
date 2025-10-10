using Domain.Entities;

namespace Domain.Repositories
{
    public interface ITransactionsRepository
    {
        Task<Transactions> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
        //Task<PagedResult<Transaction>> GetUserTransactionsAsync(TransactionQuery query, CancellationToken cancellationToken = default);
        Task<Transactions> AddAsync(Transactions transaction, CancellationToken cancellationToken = default);
        Task UpdateAsync(Transactions transaction, CancellationToken cancellationToken = default);
    }
}
