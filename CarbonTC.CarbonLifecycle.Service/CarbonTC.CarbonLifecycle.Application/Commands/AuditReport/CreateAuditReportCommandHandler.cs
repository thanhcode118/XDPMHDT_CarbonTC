using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Logging;
using CarbonTC.CarbonLifecycle.Domain.Repositories;
using CarbonTC.CarbonLifecycle.Application.Services;
using CarbonTC.CarbonLifecycle.Domain.Entities;
using CarbonTC.CarbonLifecycle.Application.DTOs;

namespace CarbonTC.CarbonLifecycle.Application.Commands.AuditReport
{
    public class CreateAuditReportCommandHandler : IRequestHandler<CreateAuditReportCommand, Guid>
    {
        private readonly IAuditReportRepository _auditReportRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IIdentityService _identityService;
        private readonly IMapper _mapper;
        private readonly ILogger<CreateAuditReportCommandHandler> _logger;

        // TODO: Tạo IAuditReportRepository và implement trong Infrastructure
        public CreateAuditReportCommandHandler(
            IAuditReportRepository auditReportRepository,
            IUnitOfWork unitOfWork,
            IIdentityService identityService,
            IMapper mapper,
            ILogger<CreateAuditReportCommandHandler> logger)
        {
            _auditReportRepository = auditReportRepository;
            _unitOfWork = unitOfWork;
            _identityService = identityService;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<Guid> Handle(CreateAuditReportCommand request, CancellationToken cancellationToken)
        {
            var changedById = _identityService.GetUserId() ?? "System";

            var auditReport = _mapper.Map<Domain.Entities.AuditReport>(request.ReportData);

            auditReport.Id = Guid.NewGuid();
            auditReport.ChangedBy = changedById;
            auditReport.ChangeDate = DateTime.UtcNow;
            auditReport.CreatedAt = auditReport.ChangeDate;
            auditReport.OriginalValues = request.ReportData.OriginalValuesJson ?? "{}";
            auditReport.NewValues = request.ReportData.NewValuesJson ?? "{}";

            // THỰC HIỆN LƯU VÀO CSDL
            await _auditReportRepository.AddAsync(auditReport);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Audit report created for EntityType: {EntityType}, EntityId: {EntityId}, Action: {Action}",
                auditReport.EntityType, auditReport.EntityId, auditReport.Action);

            return auditReport.Id;
        }
    }
}