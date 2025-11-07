using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using CarbonTC.CarbonLifecycle.Domain.Entities;
using CarbonTC.CarbonLifecycle.Domain.Repositories;
using CarbonTC.CarbonLifecycle.Infrastructure.Persistence;
using CarbonTC.CarbonLifecycle.Domain.Enums; 

namespace CarbonTC.CarbonLifecycle.Infrastructure.Persistence.Repositories
{
    public class JourneyBatchRepository : IJourneyBatchRepository
    {
        private readonly AppDbContext _context;

        public JourneyBatchRepository(AppDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<JourneyBatch?> GetByIdAsync(Guid id)
        {
            return await _context.JourneyBatches
                .FirstOrDefaultAsync(jb => jb.Id == id);
        }

        public async Task<JourneyBatch?> GetByIdWithDetailsAsync(Guid id)
        {
            return await _context.JourneyBatches
                .Include(jb => jb.EVJourneys)
                .Include(jb => jb.CarbonCredits)
                .Include(jb => jb.VerificationRequests)
                .FirstOrDefaultAsync(jb => jb.Id == id);
        }

        public async Task<IEnumerable<JourneyBatch>> GetByUserIdAsync(string userId)
        {
            if (string.IsNullOrWhiteSpace(userId))
                throw new ArgumentException("User ID cannot be null or empty", nameof(userId));

            return await _context.JourneyBatches
                .Where(jb => jb.UserId == userId)
                .OrderByDescending(jb => jb.CreationTime)
                .ToListAsync();
        }

        public async Task AddAsync(JourneyBatch journeyBatch)
        {
            if (journeyBatch == null)
                throw new ArgumentNullException(nameof(journeyBatch));

            await _context.JourneyBatches.AddAsync(journeyBatch);
        }

        public Task UpdateAsync(JourneyBatch journeyBatch)
        {
            if (journeyBatch == null)
                throw new ArgumentNullException(nameof(journeyBatch));

            journeyBatch.LastModifiedAt = DateTime.UtcNow;
            _context.JourneyBatches.Update(journeyBatch);
            return Task.CompletedTask; 
        }

        public async Task DeleteAsync(Guid id)
        {
            var batch = await _context.JourneyBatches.FindAsync(id);
            if (batch != null)
            {
                _context.JourneyBatches.Remove(batch);
            }
        }

        public async Task<JourneyBatch?> GetByIdAndOwnerAsync(Guid batchId, string ownerId)
        {
            if (string.IsNullOrWhiteSpace(ownerId))
                throw new ArgumentException("Owner ID cannot be null or empty", nameof(ownerId));

            return await _context.JourneyBatches
                .FirstOrDefaultAsync(jb => jb.Id == batchId && jb.UserId == ownerId);
        }

        public async Task<IEnumerable<JourneyBatch>> GetByOwnerIdWithJourneysAsync(string ownerId)
        {
            if (string.IsNullOrWhiteSpace(ownerId))
                throw new ArgumentException("Owner ID cannot be null or empty", nameof(ownerId));

            return await _context.JourneyBatches
                .Include(jb => jb.EVJourneys) // Include journeys để tính TotalCO2SavedKg
                .Include(jb => jb.CarbonCredits) // Include carbon credits để tính TotalCarbonCredits nếu đã issue
                .Where(jb => jb.UserId == ownerId)
                .OrderByDescending(jb => jb.CreationTime)
                .ToListAsync();
        }

        public async Task<JourneyBatch?> GetPendingBatchByOwnerIdAsync(string ownerId)
        {
            if (string.IsNullOrWhiteSpace(ownerId))
                throw new ArgumentException("Owner ID cannot be null or empty", nameof(ownerId));

            return await _context.JourneyBatches
                // Chỉ lấy lô có trạng thái Pending
                .Where(jb => jb.UserId == ownerId && jb.Status == JourneyBatchStatus.Pending)
                // Sắp xếp để lấy lô mới nhất nếu có nhiều lô Pending (tùy chọn)
                .OrderByDescending(jb => jb.CreationTime)
                .FirstOrDefaultAsync();
        }
    }
}