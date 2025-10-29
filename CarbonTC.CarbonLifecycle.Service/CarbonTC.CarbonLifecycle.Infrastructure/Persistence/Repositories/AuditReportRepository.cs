// File: CarbonTC.CarbonLifecycle.Infrastructure/Persistence/Repositories/AuditReportRepository.cs
using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using CarbonTC.CarbonLifecycle.Domain.Entities;
using CarbonTC.CarbonLifecycle.Domain.Repositories;
using CarbonTC.CarbonLifecycle.Infrastructure.Persistence;

namespace CarbonTC.CarbonLifecycle.Infrastructure.Persistence.Repositories
{
    public class AuditReportRepository : IAuditReportRepository
    {
        private readonly AppDbContext _context;
        private readonly ILogger<AuditReportRepository> _logger;

        public AuditReportRepository(AppDbContext context, ILogger<AuditReportRepository> logger)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<AuditReport?> GetByIdAsync(Guid id)
        {
            _logger.LogInformation("Fetching AuditReport with Id: {Id}", id);
            return await _context.AuditReports.FindAsync(id);
        }

        public async Task AddAsync(AuditReport report)
        {
            if (report == null)
            {
                _logger.LogError("Attempted to add a null AuditReport.");
                throw new ArgumentNullException(nameof(report));
            }
            // CreatedAt được set trong Handler hoặc BaseEntity
            await _context.AuditReports.AddAsync(report);
            _logger.LogInformation("Added new AuditReport with Id: {Id}", report.Id);
            // Không SaveChangesAsync ở đây
        }
    }
}