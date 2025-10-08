using CarbonTC.CarbonLifecycle.Service.Data;
using CarbonTC.CarbonLifecycle.Service.Models.Entities;
using CarbonTC.CarbonLifecycle.Service.Models.Enums;
using Microsoft.EntityFrameworkCore;
using System; // Thêm using System để sử dụng Guid

namespace CarbonTC.CarbonLifecycle.Service.Repositories
{
    public class VerificationRequestRepository : GenericRepository<VerificationRequest>, IVerificationRequestRepository
    {
        public VerificationRequestRepository(AppDbContext context) : base(context)
        {
        }

        // Thay đổi string ownerId thành Guid ownerId
        public async Task<IEnumerable<VerificationRequest>> GetRequestsByOwnerIdAsync(Guid ownerId)
        {
            return await _dbSet.Where(vr => vr.OwnerId == ownerId).ToListAsync();
        }

        // Thay đổi string cvaUserId thành Guid cvaUserId
        public async Task<IEnumerable<VerificationRequest>> GetRequestsForCVAAsync(Guid cvaUserId, VerificationRequestStatus? status = null)
        {
            var query = _dbSet.AsQueryable();

            if (status.HasValue)
            {
                query = query.Where(vr => vr.Status == status.Value);
            }
            // Sửa điều kiện so sánh ReviewedBy với cvaUserId (đã đổi thành Guid)
            // CVAUserId có thể xem các yêu cầu mà họ được chỉ định duyệt HOẶC các yêu cầu đang Pending và chưa có người duyệt
            return await query.Where(vr => vr.ReviewedBy == cvaUserId || (vr.Status == VerificationRequestStatus.Pending && vr.ReviewedBy == null)).ToListAsync();
        }

        // Thay đổi int batchId thành Guid batchId
        public async Task<VerificationRequest?> GetRequestByBatchIdAsync(Guid batchId)
        {
            return await _dbSet.FirstOrDefaultAsync(vr => vr.BatchId == batchId);
        }
    }
}