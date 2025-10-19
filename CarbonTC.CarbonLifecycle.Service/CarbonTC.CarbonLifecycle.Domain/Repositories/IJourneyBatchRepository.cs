using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CarbonTC.CarbonLifecycle.Domain.Entities; 

namespace CarbonTC.CarbonLifecycle.Domain.Repositories
{
    public interface IJourneyBatchRepository
    {
        Task<JourneyBatch> GetByIdAsync(Guid id);
        Task<IEnumerable<JourneyBatch>> GetByUserIdAsync(string userId);
        Task AddAsync(JourneyBatch journeyBatch);
        Task UpdateAsync(JourneyBatch journeyBatch);
        Task DeleteAsync(Guid id);
        // Bao gồm cả các Navigation Properties cần thiết cho Aggregate
        Task<JourneyBatch> GetByIdWithDetailsAsync(Guid id); // Ví dụ: bao gồm EVJourneys, VerificationRequests
    }
}