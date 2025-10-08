using CarbonTC.CarbonLifecycle.Service.Models.Entities;
using CarbonTC.CarbonLifecycle.Service.Models.Enums;
using System; // Thêm using System để sử dụng Guid

namespace CarbonTC.CarbonLifecycle.Service.Repositories
{
    public interface ICarbonCreditRepository : IGenericRepository<CarbonCredit>
    {
        // Thay đổi string ownerId thành Guid ownerId
        Task<IEnumerable<CarbonCredit>> GetCreditsByOwnerIdAsync(Guid ownerId);
        Task<IEnumerable<CarbonCredit>> GetCreditsByStatusAsync(CarbonCreditStatus status);
        Task<CarbonCredit?> GetCreditBySerialNumberAsync(string serialNumber);
    }
}