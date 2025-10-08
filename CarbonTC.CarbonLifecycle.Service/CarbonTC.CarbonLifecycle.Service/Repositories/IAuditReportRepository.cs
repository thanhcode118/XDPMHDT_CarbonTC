using CarbonTC.CarbonLifecycle.Service.Models.Entities;
using System; // Thêm using System để sử dụng Guid

namespace CarbonTC.CarbonLifecycle.Service.Repositories
{
    public interface IAuditReportRepository : IGenericRepository<AuditReport>
    {
        // Thay đổi int requestId thành Guid requestId
        Task<IEnumerable<AuditReport>> GetReportsByRequestIdAsync(Guid requestId);
        // Thay đổi string generatedByUserId thành Guid generatedByUserId
        Task<IEnumerable<AuditReport>> GetReportsByGeneratedByAsync(Guid generatedByUserId);
    }
}