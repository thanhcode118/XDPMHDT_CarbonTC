using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CarbonTC.CarbonLifecycle.Domain.Entities;

namespace CarbonTC.CarbonLifecycle.Domain.Repositories
{
    public interface IEVJourneyRepository
    {
        Task<EVJourney?> GetByIdAsync(Guid id); // Sửa: Thêm ? (nullable)
        Task<IEnumerable<EVJourney>> GetByBatchIdAsync(Guid journeyBatchId);
        Task AddAsync(EVJourney journey);
        Task UpdateAsync(EVJourney journey); // Đổi: Bỏ Task, EF Core dùng hàm sync
        Task DeleteAsync(Guid id);

        // --- BỔ SUNG CÁC HÀM SAU ---

        // Lấy tất cả hành trình của 1 người dùng
        Task<IEnumerable<EVJourney>> GetByOwnerIdAsync(string ownerId);

        // Lấy 1 hành trình cụ thể, đảm bảo đúng chủ sở hữu
        Task<EVJourney?> GetByIdAndOwnerAsync(Guid journeyId, string ownerId);

        // Lấy một danh sách hành trình theo IDs, đảm bảo đúng chủ sở hữu
        Task<IEnumerable<EVJourney>> GetByIdsAndOwnerAsync(IEnumerable<Guid> journeyIds, string ownerId);
    }
}