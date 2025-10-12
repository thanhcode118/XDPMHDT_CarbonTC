using System.Linq.Expressions;

namespace CarbonTC.CarbonLifecycle.Service.Repositories
{
    public interface IGenericRepository<T> where T : class
    {
        Task<T?> GetByIdAsync(Guid id);
        Task<IEnumerable<T>> GetAllAsync();
        Task AddAsync(T entity);
        Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> expression);

        // Đổi tên các phương thức để có hậu tố "Async" cho nhất quán
        Task UpdateAsync(T entity);
        Task DeleteAsync(T entity);
    }
}