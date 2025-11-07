using System;
using System.Threading.Tasks;
using CarbonTC.CarbonLifecycle.Domain.Entities; 

namespace CarbonTC.CarbonLifecycle.Domain.Repositories
{
    public interface IAuditReportRepository
    {
        Task<AuditReport?> GetByIdAsync(Guid id);
        Task AddAsync(AuditReport report);
        // Có thể thêm phương thức tìm kiếm theo EntityType, EntityId
    }
}