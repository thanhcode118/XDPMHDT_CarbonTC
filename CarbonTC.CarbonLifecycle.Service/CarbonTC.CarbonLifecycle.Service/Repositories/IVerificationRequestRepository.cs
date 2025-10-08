using CarbonTC.CarbonLifecycle.Service.Models.Entities;
using CarbonTC.CarbonLifecycle.Service.Models.Enums;
using System; // Thêm using System để sử dụng Guid

namespace CarbonTC.CarbonLifecycle.Service.Repositories
{
    public interface IVerificationRequestRepository : IGenericRepository<VerificationRequest>
    {
        // Thay đổi string ownerId thành Guid ownerId
        Task<IEnumerable<VerificationRequest>> GetRequestsByOwnerIdAsync(Guid ownerId);
        // Thay đổi string cvaUserId thành Guid cvaUserId
        Task<IEnumerable<VerificationRequest>> GetRequestsForCVAAsync(Guid cvaUserId, VerificationRequestStatus? status = null);
        // Thay đổi int batchId thành Guid batchId
        Task<VerificationRequest?> GetRequestByBatchIdAsync(Guid batchId); // Mỗi batch có 1 request
    }
}