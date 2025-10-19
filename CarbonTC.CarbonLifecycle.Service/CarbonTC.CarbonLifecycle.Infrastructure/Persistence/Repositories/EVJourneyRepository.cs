using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using CarbonTC.CarbonLifecycle.Domain.Entities;
using CarbonTC.CarbonLifecycle.Domain.Repositories;
using CarbonTC.CarbonLifecycle.Infrastructure.Persistence;

namespace CarbonTC.CarbonLifecycle.Infrastructure.Persistence.Repositories
{
    public class EVJourneyRepository : IEVJourneyRepository
    {
        private readonly AppDbContext _context;

        public EVJourneyRepository(AppDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<EVJourney?> GetByIdAsync(Guid id)
        {
            return await _context.EVJourneys
                .Include(j => j.JourneyBatch)
                .FirstOrDefaultAsync(j => j.Id == id);
        }

        public async Task<IEnumerable<EVJourney>> GetByBatchIdAsync(Guid journeyBatchId)
        {
            return await _context.EVJourneys
                .Where(j => j.JourneyBatchId == journeyBatchId)
                .OrderBy(j => j.StartTime)
                .ToListAsync();
        }

        public async Task AddAsync(EVJourney journey)
        {
            if (journey == null)
                throw new ArgumentNullException(nameof(journey));

            await _context.EVJourneys.AddAsync(journey);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(EVJourney journey)
        {
            if (journey == null)
                throw new ArgumentNullException(nameof(journey));

            journey.LastModifiedAt = DateTime.UtcNow;
            _context.EVJourneys.Update(journey);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var journey = await _context.EVJourneys.FindAsync(id);
            if (journey != null)
            {
                _context.EVJourneys.Remove(journey);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<IEnumerable<EVJourney>> GetByOwnerIdAsync(string ownerId)
        {
            if (string.IsNullOrWhiteSpace(ownerId))
                throw new ArgumentException("Owner ID cannot be null or empty", nameof(ownerId));

            return await _context.EVJourneys
                .Where(j => j.UserId == ownerId)
                .OrderByDescending(j => j.StartTime)
                .ToListAsync();
        }

        public async Task<EVJourney?> GetByIdAndOwnerAsync(Guid journeyId, string ownerId)
        {
            if (string.IsNullOrWhiteSpace(ownerId))
                throw new ArgumentException("Owner ID cannot be null or empty", nameof(ownerId));

            return await _context.EVJourneys
                .Include(j => j.JourneyBatch)
                .FirstOrDefaultAsync(j => j.Id == journeyId && j.UserId == ownerId);
        }

        public async Task<IEnumerable<EVJourney>> GetByIdsAndOwnerAsync(IEnumerable<Guid> journeyIds, string ownerId)
        {
            if (journeyIds == null || !journeyIds.Any())
                return Enumerable.Empty<EVJourney>();

            if (string.IsNullOrWhiteSpace(ownerId))
                throw new ArgumentException("Owner ID cannot be null or empty", nameof(ownerId));

            return await _context.EVJourneys
                .Where(j => journeyIds.Contains(j.Id) && j.UserId == ownerId)
                .ToListAsync();
        }
    }
}
