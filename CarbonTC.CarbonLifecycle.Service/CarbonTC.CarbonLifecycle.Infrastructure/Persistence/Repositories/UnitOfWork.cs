using CarbonTC.CarbonLifecycle.Domain.Repositories;
using CarbonTC.CarbonLifecycle.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging; 

namespace CarbonTC.CarbonLifecycle.Infrastructure.Persistence.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly AppDbContext _context;
        private readonly ILogger<UnitOfWork> _logger; 

        // Sửa constructor để nhận thêm ILogger
        public UnitOfWork(AppDbContext context, ILogger<UnitOfWork> logger)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger)); // Khởi tạo logger
        }

        public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                // TODO: Thêm logic xử lý Domain Events trước khi SaveChanges ở đây nếu cần thiết

                var entriesChanged = await _context.SaveChangesAsync(cancellationToken);
                _logger.LogInformation("{Count} entries changed in the database.", entriesChanged); // Log số lượng thay đổi
                return entriesChanged;
            }
            catch (DbUpdateException ex) // Bắt lỗi cụ thể của EF Core
            {
                _logger.LogError(ex, "An error occurred while saving changes to the database.");
                throw; 
            }
            catch (Exception ex) // Bắt các lỗi khác
            {
                _logger.LogError(ex, "An unexpected error occurred during SaveChangesAsync.");
                throw;
            }
        }
    }
}