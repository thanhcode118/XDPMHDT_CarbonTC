using CarbonTC.CarbonLifecycle.Service.Data;
using Microsoft.EntityFrameworkCore;
using System; // Thêm using System để sử dụng Guid
using System.Linq.Expressions;

namespace CarbonTC.CarbonLifecycle.Service.Repositories
{
    public class GenericRepository<T> : IGenericRepository<T> where T : class
    {
        protected readonly AppDbContext _context;
        protected readonly DbSet<T> _dbSet;

        public GenericRepository(AppDbContext context)
        {
            _context = context;
            _dbSet = _context.Set<T>();
        }

        // Thay đổi int id thành Guid id
        public async Task<T?> GetByIdAsync(Guid id)
        {
            // FindAsync có thể không hoạt động trực tiếp với Guid cho mọi trường hợp,
            // nhưng nếu PK của T là Guid, EF Core sẽ xử lý đúng.
            // Nếu không, cần dùng FirstOrDefaultAsync: return await _dbSet.FirstOrDefaultAsync(e => EF.Property<Guid>(e, "Id") == id);
            // Tuy nhiên, với convention của EF Core, FindAsync sẽ hoạt động nếu PK là Guid.
            return await _dbSet.FindAsync(id);
        }

        public async Task<IEnumerable<T>> GetAllAsync()
        {
            return await _dbSet.ToListAsync();
        }

        public async Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate)
        {
            return await _dbSet.Where(predicate).ToListAsync();
        }

        public async Task AddAsync(T entity)
        {
            await _dbSet.AddAsync(entity);
        }

        public void Update(T entity)
        {
            _dbSet.Update(entity);
        }

        public void Delete(T entity)
        {
            _dbSet.Remove(entity);
        }

        public async Task<int> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync();
        }
    }
}