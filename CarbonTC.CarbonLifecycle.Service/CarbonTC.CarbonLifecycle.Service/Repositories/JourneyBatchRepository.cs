using CarbonTC.CarbonLifecycle.Service.Data;
using CarbonTC.CarbonLifecycle.Service.Models.Entities;
using Microsoft.EntityFrameworkCore;
using System; // Thêm using System để sử dụng Guid

namespace CarbonTC.CarbonLifecycle.Service.Repositories
{
    public class JourneyBatchRepository : GenericRepository<JourneyBatch>, IJourneyBatchRepository
    {
        public JourneyBatchRepository(AppDbContext context) : base(context)
        {
        }

        // Thay đổi int batchId thành Guid batchId
        public async Task<JourneyBatch?> GetBatchWithJourneysAsync(Guid batchId)
        {
            // Bao gồm danh sách EVJourneys liên quan đến JourneyBatch này
            return await _dbSet
                         .Include(jb => jb.Journeys) // Sử dụng Navigation Property 'Journeys' như trong JourneyBatch entity đã gửi
                         .FirstOrDefaultAsync(jb => jb.BatchId == batchId);
        }

        // Thay đổi string ownerId thành Guid ownerId
        public async Task<IEnumerable<JourneyBatch>> GetBatchesByOwnerIdAsync(Guid ownerId)
        {
            return await _dbSet.Where(jb => jb.OwnerId == ownerId).ToListAsync();
        }
    }
}