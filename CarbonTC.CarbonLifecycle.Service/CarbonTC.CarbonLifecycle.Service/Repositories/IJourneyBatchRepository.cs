using CarbonTC.CarbonLifecycle.Service.Models.Entities;
using System; // Thêm using System để sử dụng Guid

namespace CarbonTC.CarbonLifecycle.Service.Repositories
{
    public interface IJourneyBatchRepository : IGenericRepository<JourneyBatch>
    {
        // Thay đổi int batchId thành Guid batchId
        Task<JourneyBatch?> GetBatchWithJourneysAsync(Guid batchId);
        // Thay đổi string ownerId thành Guid ownerId
        Task<IEnumerable<JourneyBatch>> GetBatchesByOwnerIdAsync(Guid ownerId);
    }
}