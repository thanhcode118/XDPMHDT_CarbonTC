using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CarbonTC.CarbonLifecycle.Domain.Entities; 

namespace CarbonTC.CarbonLifecycle.Domain.Repositories
{
    public interface ICarbonCreditRepository
    {
        Task<CarbonCredit> GetByIdAsync(Guid id);
        Task<IEnumerable<CarbonCredit>> GetByJourneyBatchIdAsync(Guid journeyBatchId);
        Task<IEnumerable<CarbonCredit>> GetByUserIdAsync(string userId);
        Task AddAsync(CarbonCredit carbonCredit);
        Task UpdateAsync(CarbonCredit carbonCredit);
        Task DeleteAsync(Guid id);
    }
}