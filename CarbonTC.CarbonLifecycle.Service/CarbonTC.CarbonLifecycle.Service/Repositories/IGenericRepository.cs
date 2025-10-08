using System; // Thêm using System để sử dụng Guid
using System.Linq.Expressions;

namespace CarbonTC.CarbonLifecycle.Service.Repositories
{
    public interface IGenericRepository<T> where T : class
    {
        // Thay đổi int id thành Guid id
        Task<T?> GetByIdAsync(Guid id);
        Task<IEnumerable<T>> GetAllAsync();
        Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate);
        Task AddAsync(T entity);
        void Update(T entity);
        void Delete(T entity);
        Task<int> SaveChangesAsync();
    }
}