using CarbonTC.CarbonLifecycle.Domain.Entities;
using CarbonTC.CarbonLifecycle.Domain.Enums;
using CarbonTC.CarbonLifecycle.Domain.Repositories;
using CarbonTC.CarbonLifecycle.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace CarbonTC.CarbonLifecycle.Infrastructure.Persistence.Repositories
{
    public class VerificationRequestRepository : IVerificationRequestRepository
    {
        private readonly AppDbContext _context;
        private readonly ILogger<VerificationRequestRepository> _logger;

        public VerificationRequestRepository(AppDbContext context, ILogger<VerificationRequestRepository> logger)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<VerificationRequest?> GetByIdAsync(Guid id) 
        {
            _logger.LogInformation("Fetching VerificationRequest with Id: {Id}", id);
            // Include JourneyBatch nếu cần truy cập thông tin batch liên quan
            return await _context.VerificationRequests
                .Include(vr => vr.JourneyBatch)
                .Include(vr => vr.CvaStandard) 
                .FirstOrDefaultAsync(vr => vr.Id == id);
        }

        public async Task<IEnumerable<VerificationRequest>> GetByJourneyBatchIdAsync(Guid journeyBatchId)
        {
            _logger.LogInformation("Fetching VerificationRequests for JourneyBatchId: {JourneyBatchId}", journeyBatchId);
            return await _context.VerificationRequests
                .Where(vr => vr.JourneyBatchId == journeyBatchId)
                .OrderByDescending(vr => vr.RequestDate)
                .ToListAsync();
        }

        public async Task AddAsync(VerificationRequest request)
        {
            if (request == null)
            {
                _logger.LogError("Attempted to add a null VerificationRequest.");
                throw new ArgumentNullException(nameof(request));
            }
            request.CreatedAt = DateTime.UtcNow;
            await _context.VerificationRequests.AddAsync(request);
            _logger.LogInformation("Added new VerificationRequest with Id: {Id}", request.Id);
            // Không SaveChangesAsync
        }

        // Sửa UpdateAsync thành Task
        public Task UpdateAsync(VerificationRequest request)
        {
            if (request == null)
            {
                _logger.LogError("Attempted to update a null VerificationRequest.");
                throw new ArgumentNullException(nameof(request));
            }
            request.LastModifiedAt = DateTime.UtcNow;
            _context.VerificationRequests.Update(request); // EF Core Update là sync
            _logger.LogInformation("Marked VerificationRequest with Id: {Id} as modified.", request.Id);
            return Task.CompletedTask; // Trả về Task hoàn thành
        }

        public async Task DeleteAsync(Guid id)
        {
            var request = await GetByIdAsync(id);
            if (request != null)
            {
                _context.VerificationRequests.Remove(request);
                _logger.LogInformation("Marked VerificationRequest with Id: {Id} for deletion.", id);
                // Không SaveChangesAsync
            }
            else
            {
                _logger.LogWarning("VerificationRequest with Id: {Id} not found for deletion.", id);
            }
        }

        public async Task<IEnumerable<VerificationRequest>> GetAllPendingAsync()
        {
            _logger.LogInformation("Fetching all pending VerificationRequests.");
            return await _context.VerificationRequests
                .Where(vr => vr.Status == VerificationRequestStatus.Pending)
                .OrderByDescending(vr => vr.RequestDate)
                .ToListAsync();
        }

        public async Task<(IEnumerable<VerificationRequest>, int)> GetPendingWithPaginationAsync(int pageNumber, int pageSize)
        {
            _logger.LogInformation("Fetching pending VerificationRequests - Page: {PageNumber}, Size: {PageSize}", pageNumber, pageSize);

            var query = _context.VerificationRequests
                .Where(vr => vr.Status == VerificationRequestStatus.Pending);

            var totalCount = await query.CountAsync(); // Đếm tổng số lượng trước khi phân trang

            var items = await query
                .OrderByDescending(vr => vr.RequestDate)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }

        
    }
}