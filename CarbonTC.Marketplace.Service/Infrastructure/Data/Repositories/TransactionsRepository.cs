using Domain.Entities;
using Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data.Repositories
{
    public class TransactionsRepository : ITransactionsRepository
    {
        private readonly ApplicationDbContext _dbContext;

        public TransactionsRepository(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }
        public async Task<Transactions> AddAsync(Transactions transaction, CancellationToken cancellationToken = default)
        {
            await _dbContext.Transactions.AddAsync(transaction);
            return transaction;
        }

        public async Task<Transactions> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var transaction = await _dbContext.Transactions.FirstOrDefaultAsync(x => x.Id == id);
            return transaction;
        }

        public Task UpdateAsync(Transactions transaction, CancellationToken cancellationToken = default)
        {
            _dbContext.Transactions.Update(transaction);
            return Task.CompletedTask;
        }
    }
}
