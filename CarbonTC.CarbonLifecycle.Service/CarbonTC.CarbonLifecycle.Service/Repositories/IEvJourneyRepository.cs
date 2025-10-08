using CarbonTC.CarbonLifecycle.Service.Models.Entities;
using System; // Thêm using System để sử dụng Guid

namespace CarbonTC.CarbonLifecycle.Service.Repositories
{
    public interface IEvJourneyRepository : IGenericRepository<EVJourney>
    {
        // Thay đổi string ownerId thành Guid ownerId
        Task<IEnumerable<EVJourney>> GetJourneysByOwnerIdAsync(Guid ownerId);
        // Thay đổi string ownerId thành Guid ownerId
        Task<IEnumerable<EVJourney>> GetUnbatchedJourneysByOwnerIdAsync(Guid ownerId);
    }
}