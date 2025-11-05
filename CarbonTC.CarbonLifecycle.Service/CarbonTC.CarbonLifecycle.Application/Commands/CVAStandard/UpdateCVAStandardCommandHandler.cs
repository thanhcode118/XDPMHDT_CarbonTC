using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using CarbonTC.CarbonLifecycle.Domain.Repositories;
using CarbonTC.CarbonLifecycle.Application.DTOs;
using CarbonTC.CarbonLifecycle.Application.Commands.AuditReport;
using System.Collections.Generic;
using CarbonTC.CarbonLifecycle.Domain.Entities;

namespace CarbonTC.CarbonLifecycle.Application.Commands.CVAStandard
{
    public class UpdateCVAStandardCommandHandler : IRequestHandler<UpdateCVAStandardCommand, CvaStandardDto>
    {
        private readonly ICVAStandardRepository _standardRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ILogger<UpdateCVAStandardCommandHandler> _logger;
        private readonly IMediator _mediator;

        public UpdateCVAStandardCommandHandler(
            ICVAStandardRepository standardRepository,
            IUnitOfWork unitOfWork,
            IMapper mapper,
            ILogger<UpdateCVAStandardCommandHandler> logger,
            IMediator mediator)
        {
            _standardRepository = standardRepository;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _logger = logger;
            _mediator = mediator;
        }

        public async Task<CvaStandardDto> Handle(UpdateCVAStandardCommand request, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Attempting to update CVA Standard with ID: {StandardId}", request.StandardId);

            // 1. Tìm Entity
            var standard = await _standardRepository.GetByIdAsync(request.StandardId);

            if (standard == null)
            {
                _logger.LogWarning("CVA Standard not found for update: {StandardId}", request.StandardId);
                // Dùng KeyNotFoundException để Controller trả về 404
                throw new KeyNotFoundException($"CVA Standard with ID {request.StandardId} not found.");
            }

            // 2. Lưu trữ giá trị cũ cho Audit Log
            // Map Entity hiện tại (trước khi update) sang DTO để có OldValuesJson
            var oldValuesDto = _mapper.Map<CVAStandardUpdateDto>(standard);

            // 3. Cập nhật Entity - SỬ DỤNG METHOD TRONG DOMAIN ENTITY
            standard.UpdateDetails(
                request.UpdateData.StandardName,
                request.UpdateData.VehicleType,
                request.UpdateData.ConversionRate,
                request.UpdateData.MinDistanceRequirement,
                request.UpdateData.EffectiveDate,
                request.UpdateData.EndDate,
                request.UpdateData.IsActive
            );

            // 4. Lưu thay đổi
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Successfully updated CVA Standard ID: {StandardId}", standard.Id);

            // 5. Ghi Audit Log
            var auditCommand = new CreateAuditReportCommand(new AuditReportCreateDto
            {
                EntityType = nameof(CVAStandard),
                EntityId = standard.Id,
                Action = "Updated",
                OriginalValuesJson = JsonSerializer.Serialize(oldValuesDto),
                NewValuesJson = JsonSerializer.Serialize(request.UpdateData)
            });
            _ = _mediator.Send(auditCommand, cancellationToken);

            // 6. Trả về DTO
            return _mapper.Map<CvaStandardDto>(standard);
        }
    }
}