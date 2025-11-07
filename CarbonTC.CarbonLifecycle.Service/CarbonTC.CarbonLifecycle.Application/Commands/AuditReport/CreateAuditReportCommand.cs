using MediatR;
using CarbonTC.CarbonLifecycle.Application.DTOs;
using System;

namespace CarbonTC.CarbonLifecycle.Application.Commands.AuditReport
{
    // Command này có thể trả về void hoặc Guid của report đã tạo
    public class CreateAuditReportCommand : IRequest<Guid>
    {
        public AuditReportCreateDto ReportData { get; }

        public CreateAuditReportCommand(AuditReportCreateDto reportData)
        {
            ReportData = reportData ?? throw new ArgumentNullException(nameof(reportData));
        }
    }
}