using CarbonTC.CarbonLifecycle.Domain.Entities;
using CarbonTC.CarbonLifecycle.Domain.Repositories;
using CarbonTC.CarbonLifecycle.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace CarbonTC.CarbonLifecycle.Infrastructure.Persistence.Repositories
{
    public class CarbonCreditRepository : ICarbonCreditRepository
    {
        private readonly AppDbContext _context;
        private readonly ILogger<CarbonCreditRepository> _logger;

        public CarbonCreditRepository(AppDbContext context, ILogger<CarbonCreditRepository> logger)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<CarbonCredit?> GetByIdAsync(Guid id) 
        {
            _logger.LogInformation("Fetching CarbonCredit with Id: {Id}", id);
            return await _context.CarbonCredits
                .Include(cc => cc.JourneyBatch)
                .Include(cc => cc.VerificationRequest) 
                .FirstOrDefaultAsync(cc => cc.Id == id);
        }

        public async Task<IEnumerable<CarbonCredit>> GetByJourneyBatchIdAsync(Guid journeyBatchId)
        {
            _logger.LogInformation("Fetching CarbonCredits for JourneyBatchId: {JourneyBatchId}", journeyBatchId);
            return await _context.CarbonCredits
                .Where(cc => cc.JourneyBatchId == journeyBatchId)
                .OrderByDescending(cc => cc.IssueDate)
                .ToListAsync();
        }
        public async Task<IEnumerable<CarbonCredit>> GetByUserIdAsync(string userId)
        {
            if (string.IsNullOrWhiteSpace(userId))
            {
                _logger.LogError("Attempted to fetch CarbonCredits with null or empty UserId.");
                throw new ArgumentException("User ID cannot be null or empty.", nameof(userId));
            }
            _logger.LogInformation("Fetching CarbonCredits for UserId: {UserId}", userId);
            return await _context.CarbonCredits
                .Where(cc => cc.UserId == userId)
                .Include(cc => cc.JourneyBatch) // Include batch để có thêm context
                .OrderByDescending(cc => cc.IssueDate)
                .ToListAsync();
        }

        public async Task AddAsync(CarbonCredit carbonCredit)
        {
            if (carbonCredit == null)
            {
                _logger.LogError("Attempted to add a null CarbonCredit.");
                throw new ArgumentNullException(nameof(carbonCredit));
            }
            carbonCredit.CreatedAt = DateTime.UtcNow;
            await _context.CarbonCredits.AddAsync(carbonCredit);
            _logger.LogInformation("Added new CarbonCredit with Id: {Id}", carbonCredit.Id);
            // Không SaveChangesAsync
        }

        public Task UpdateAsync(CarbonCredit carbonCredit)
        {
            if (carbonCredit == null)
            {
                _logger.LogError("Attempted to update a null CarbonCredit.");
                throw new ArgumentNullException(nameof(carbonCredit));
            }
            carbonCredit.LastModifiedAt = DateTime.UtcNow;
            _context.CarbonCredits.Update(carbonCredit);
            _logger.LogInformation("Marked CarbonCredit with Id: {Id} as modified.", carbonCredit.Id);
            // Không SaveChangesAsync
            return Task.CompletedTask;
        }

        public async Task DeleteAsync(Guid id)
        {
            var credit = await GetByIdAsync(id);
            if (credit != null)
            {
                _context.CarbonCredits.Remove(credit);
                _logger.LogInformation("Marked CarbonCredit with Id: {Id} for deletion.", id);
                // Không SaveChangesAsync
            }
            else
            {
                _logger.LogWarning("CarbonCredit with Id: {Id} not found for deletion.", id);
            }
        }
    }
}