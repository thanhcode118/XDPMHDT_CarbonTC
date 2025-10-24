using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CarbonTC.CarbonLifecycle.Domain.Entities;
using CarbonTC.CarbonLifecycle.Domain.Enums; 

namespace CarbonTC.CarbonLifecycle.Domain.Repositories
{
    public interface IJourneyBatchRepository
    {
        Task<JourneyBatch?> GetByIdAsync(Guid id); // Sửa: Thêm ? (nullable)
        Task<IEnumerable<JourneyBatch>> GetByUserIdAsync(string userId);
        Task AddAsync(JourneyBatch journeyBatch);
        Task UpdateAsync(JourneyBatch journeyBatch); // Đổi: Bỏ Task (giống trên)
        Task DeleteAsync(Guid id);
        Task<JourneyBatch?> GetByIdWithDetailsAsync(Guid id); // Sửa: Thêm ?

        // --- BỔ SUNG CÁC HÀM SAU ---

        // Lấy 1 lô cụ thể, đảm bảo đúng chủ sở hữu
        Task<JourneyBatch?> GetByIdAndOwnerAsync(Guid batchId, string ownerId);

        // Lấy tất cả các lô của 1 người dùng, và tải kèm các hành trình (journeys)
        Task<IEnumerable<JourneyBatch>> GetByOwnerIdWithJourneysAsync(string ownerId);
        // Tìm lô đang chờ xử lý (Pending) của một người dùng
        Task<JourneyBatch?> GetPendingBatchByOwnerIdAsync(string ownerId);
    }
}