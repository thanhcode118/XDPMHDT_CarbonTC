using CarbonTC.CarbonLifecycle.Service.Data;
using CarbonTC.CarbonLifecycle.Service.Models.Entities;
using Microsoft.EntityFrameworkCore;
using System; // Thêm using System để sử dụng Guid

namespace CarbonTC.CarbonLifecycle.Service.Repositories
{
    public class EvJourneyRepository : GenericRepository<EVJourney>, IEvJourneyRepository
    {
        public EvJourneyRepository(AppDbContext context) : base(context)
        {
        }

        // Thay đổi string ownerId thành Guid ownerId
        public async Task<IEnumerable<EVJourney>> GetJourneysByOwnerIdAsync(Guid ownerId)
        {
            return await _dbSet.Where(j => j.OwnerId == ownerId).ToListAsync();
        }

        // Thay đổi string ownerId thành Guid ownerId
        public async Task<IEnumerable<EVJourney>> GetUnbatchedJourneysByOwnerIdAsync(Guid ownerId)
        {
            // Sửa điều kiện so sánh BatchId:
            // - BatchId là Guid?, nên so sánh với null để kiểm tra "chưa có batch"
            // - Loại bỏ || j.BatchID == 0 vì Guid không so sánh với int 0
            return await _dbSet
                         .Where(j => j.OwnerId == ownerId && j.BatchId == null)
                         .ToListAsync();
        }
    }
}