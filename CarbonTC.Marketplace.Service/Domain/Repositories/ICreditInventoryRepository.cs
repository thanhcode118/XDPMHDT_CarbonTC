using Domain.Entities;

namespace Domain.Repositories
{
    public interface ICreditInventoryRepository
    {
        Task<CreditInventory?> GetByCreditIdAsync(Guid creditId, CancellationToken cancellationToken = default);
        Task UpdateAsync(CreditInventory inventory, CancellationToken cancellationToken = default);
        Task AddAsync(CreditInventory inventory, CancellationToken cancellationToken = default);
        Task DeleteAsync(CreditInventory inventory, CancellationToken cancellationToken = default);
        Task<decimal> GetTotalSupplyByTypeAsync(CancellationToken cancellationToken = default);
    }
}
