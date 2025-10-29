// File: CarbonTC.CarbonLifecycle.Application/Commands/AuditReport/CreateAuditReportCommandHandler.cs
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Logging;
using CarbonTC.CarbonLifecycle.Domain.Repositories;
using CarbonTC.CarbonLifecycle.Application.Services;
using CarbonTC.CarbonLifecycle.Domain.Entities; // Cần entity AuditReport
using CarbonTC.CarbonLifecycle.Application.DTOs;

namespace CarbonTC.CarbonLifecycle.Application.Commands.AuditReport
{
    public class CreateAuditReportCommandHandler : IRequestHandler<CreateAuditReportCommand, Guid>
    {
        // Tạm thời chưa có IAuditReportRepository, cần tạo nó
        // private readonly IAuditReportRepository _auditReportRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IIdentityService _identityService;
        private readonly IMapper _mapper;
        private readonly ILogger<CreateAuditReportCommandHandler> _logger;

        // TODO: Tạo IAuditReportRepository và implement trong Infrastructure
        public CreateAuditReportCommandHandler(
            /* IAuditReportRepository auditReportRepository, */
            IUnitOfWork unitOfWork,
            IIdentityService identityService,
            IMapper mapper,
            ILogger<CreateAuditReportCommandHandler> logger)
        {
            // _auditReportRepository = auditReportRepository;
            _unitOfWork = unitOfWork;
            _identityService = identityService;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<Guid> Handle(CreateAuditReportCommand request, CancellationToken cancellationToken)
        {
            var changedById = _identityService.GetUserId() ?? "System"; // Lấy UserID hoặc dùng "System" nếu không có

            // TODO: Uncomment khi có Repository
            /*
            var auditReport = _mapper.Map<Domain.Entities.AuditReport>(request.ReportData);

            auditReport.Id = Guid.NewGuid(); // Đảm bảo có ID mới
            auditReport.ChangedBy = changedById;
            auditReport.ChangeDate = DateTime.UtcNow;
            auditReport.CreatedAt = auditReport.ChangeDate; // Set CreatedAt

            await _auditReportRepository.AddAsync(auditReport);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Audit report created for EntityType: {EntityType}, EntityId: {EntityId}, Action: {Action}",
                auditReport.EntityType, auditReport.EntityId, auditReport.Action);

            return auditReport.Id;
            */

            // Tạm thời return Guid rỗng và log warning
            _logger.LogWarning("IAuditReportRepository not implemented. Audit report not saved for EntityType: {EntityType}, EntityId: {EntityId}, Action: {Action}",
                request.ReportData.EntityType, request.ReportData.EntityId, request.ReportData.Action);
            await Task.CompletedTask; // Giả lập async
            return Guid.Empty;
        }
    }
}