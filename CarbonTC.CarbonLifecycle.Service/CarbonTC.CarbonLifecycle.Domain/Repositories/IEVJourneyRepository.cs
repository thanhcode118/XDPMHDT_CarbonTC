using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CarbonTC.CarbonLifecycle.Domain.Entities; 

namespace CarbonTC.CarbonLifecycle.Domain.Repositories
{
    public interface IEVJourneyRepository
    {
        Task<EVJourney> GetByIdAsync(Guid id);
        Task<IEnumerable<EVJourney>> GetByBatchIdAsync(Guid journeyBatchId);
        Task AddAsync(EVJourney journey);
        Task UpdateAsync(EVJourney journey);
        Task DeleteAsync(Guid id);
        // Có thể thêm các phương thức tìm kiếm theo tiêu chí khác
    }
}