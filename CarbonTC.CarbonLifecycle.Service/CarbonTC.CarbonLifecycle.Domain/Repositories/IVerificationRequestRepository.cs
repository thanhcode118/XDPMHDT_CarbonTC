using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CarbonTC.CarbonLifecycle.Domain.Entities; 

namespace CarbonTC.CarbonLifecycle.Domain.Repositories
{
    public interface IVerificationRequestRepository
    {
        Task<VerificationRequest> GetByIdAsync(Guid id);
        Task<IEnumerable<VerificationRequest>> GetByJourneyBatchIdAsync(Guid journeyBatchId);
        Task AddAsync(VerificationRequest request);
        Task UpdateAsync(VerificationRequest request);
        Task DeleteAsync(Guid id);
    }
}