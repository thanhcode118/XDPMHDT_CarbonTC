using CarbonTC.CarbonLifecycle.Service.Data;
using CarbonTC.CarbonLifecycle.Service.Models.Entities;
using Microsoft.EntityFrameworkCore;
using System; // Thêm using System để sử dụng Guid

namespace CarbonTC.CarbonLifecycle.Service.Repositories
{
    public class AuditReportRepository : GenericRepository<AuditReport>, IAuditReportRepository
    {
        public AuditReportRepository(AppDbContext context) : base(context)
        {
        }

        // Thay đổi int requestId thành Guid requestId
        public async Task<IEnumerable<AuditReport>> GetReportsByRequestIdAsync(Guid requestId)
        {
            return await _dbSet.Where(ar => ar.RequestId == requestId).ToListAsync();
        }

        // Thay đổi string generatedByUserId thành Guid generatedByUserId
        public async Task<IEnumerable<AuditReport>> GetReportsByGeneratedByAsync(Guid generatedByUserId)
        {
            return await _dbSet.Where(ar => ar.GeneratedBy == generatedByUserId).ToListAsync();
        }
    }
}