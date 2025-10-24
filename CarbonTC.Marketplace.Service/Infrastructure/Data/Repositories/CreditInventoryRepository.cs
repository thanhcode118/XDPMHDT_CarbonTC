using Domain.Entities;
using Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data.Repositories
{
    public class CreditInventoryRepository : ICreditInventoryRepository
    {
        private readonly ApplicationDbContext _dbContext;

        public CreditInventoryRepository(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<CreditInventory?> GetByCreditIdAsync(Guid creditId, CancellationToken cancellationToken = default)
        {
            return await _dbContext.CreditInventories
                .FirstOrDefaultAsync(ci => ci.CreditId == creditId, cancellationToken);
        }

        public async Task AddAsync(CreditInventory inventory, CancellationToken cancellationToken = default)
        {
            await _dbContext.CreditInventories.AddAsync(inventory, cancellationToken);
        }

        public Task UpdateAsync(CreditInventory inventory, CancellationToken cancellationToken = default)
        {
            _dbContext.CreditInventories.Update(inventory);
            return Task.CompletedTask;
        }

        public Task DeleteAsync(CreditInventory inventory, CancellationToken cancellationToken = default)
        {
            _dbContext.CreditInventories.Remove(inventory);
            return Task.CompletedTask;
        }

        public Task<decimal> GetTotalSupplyByTypeAsync(CancellationToken cancellationToken = default)
        {
            var query = _dbContext.CreditInventories.Select(x => x.AvailableAmount).AsQueryable();
            return query.Any()
                ? query.SumAsync(cancellationToken)
                : Task.FromResult(0m);
        }
    }
}
