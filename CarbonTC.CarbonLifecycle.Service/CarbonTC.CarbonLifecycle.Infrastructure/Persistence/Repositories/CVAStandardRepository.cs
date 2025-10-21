using CarbonTC.CarbonLifecycle.Domain.Entities;
using CarbonTC.CarbonLifecycle.Domain.Repositories;
using CarbonTC.CarbonLifecycle.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging; 

namespace CarbonTC.CarbonLifecycle.Infrastructure.Persistence.Repositories
{
    public class CVAStandardRepository : ICVAStandardRepository
    {
        private readonly AppDbContext _context;
        private readonly ILogger<CVAStandardRepository> _logger; 

        public CVAStandardRepository(AppDbContext context, ILogger<CVAStandardRepository> logger) // Thêm logger vào constructor
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger)); // Khởi tạo logger
        }

        public async Task<CVAStandard?> GetByIdAsync(Guid id)
        {
            _logger.LogInformation("Fetching CVAStandard with Id: {Id}", id);
            return await _context.CVAStandards.FindAsync(id);
        }

        public async Task<IEnumerable<CVAStandard>> GetAllActiveStandardsAsync()
        {
            _logger.LogInformation("Fetching all active CVAStandards");
            var now = DateTime.UtcNow;
            return await _context.CVAStandards
                .Where(s => s.IsActive && s.EffectiveDate <= now && (s.EndDate == null || s.EndDate > now))
                .OrderBy(s => s.StandardName)
                .ToListAsync();
        }

        public async Task<CVAStandard?> GetActiveStandardByVehicleTypeAsync(string vehicleType)
        {
            _logger.LogInformation("Fetching active CVAStandard for VehicleType: {VehicleType}", vehicleType);
            var now = DateTime.UtcNow;
            return await _context.CVAStandards
                .Where(s => s.VehicleType == vehicleType
                            && s.IsActive
                            && s.EffectiveDate <= now
                            && (s.EndDate == null || s.EndDate > now))
                .FirstOrDefaultAsync();
        }

        public async Task AddAsync(CVAStandard standard)
        {
            if (standard == null)
            {
                _logger.LogError("Attempted to add a null CVAStandard.");
                throw new ArgumentNullException(nameof(standard));
            }
            standard.CreatedAt = DateTime.UtcNow; // Đảm bảo CreatedAt được set
            await _context.CVAStandards.AddAsync(standard);
            _logger.LogInformation("Added new CVAStandard with Id: {Id}", standard.Id);
            // Không SaveChangesAsync ở đây
        }

        public Task UpdateAsync(CVAStandard standard)
        {
            if (standard == null)
            {
                _logger.LogError("Attempted to update a null CVAStandard.");
                throw new ArgumentNullException(nameof(standard));
            }
            standard.LastModifiedAt = DateTime.UtcNow;
            _context.CVAStandards.Update(standard);
            _logger.LogInformation("Marked CVAStandard with Id: {Id} as modified.", standard.Id);
            // Không SaveChangesAsync ở đây (Update là sync)
            return Task.CompletedTask;
        }

        public async Task DeleteAsync(Guid id)
        {
            var standard = await GetByIdAsync(id);
            if (standard != null)
            {
                _context.CVAStandards.Remove(standard);
                _logger.LogInformation("Marked CVAStandard with Id: {Id} for deletion.", id);
                // Không SaveChangesAsync ở đây
            }
            else
            {
                _logger.LogWarning("CVAStandard with Id: {Id} not found for deletion.", id);
            }
        }
    }
}