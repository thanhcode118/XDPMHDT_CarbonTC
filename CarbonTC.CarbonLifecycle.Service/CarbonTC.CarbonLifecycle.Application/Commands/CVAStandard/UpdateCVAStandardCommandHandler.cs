// File: CarbonTC.CarbonLifecycle.Application/Commands/CVAStandard/UpdateCVAStandardCommandHandler.cs
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
using CarbonTC.CarbonLifecycle.Domain.Entities; // Cần entity CVAStandard

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
            _logger.LogInformation("Attempting to update CVA Standard ID: {StandardId}", request.StandardId);

            var standard = await _standardRepository.GetByIdAsync(request.StandardId);
            if (standard == null)
            {
                _logger.LogWarning("CVA Standard not found for update: {StandardId}", request.StandardId);
                throw new KeyNotFoundException($"CVA Standard with ID {request.StandardId} not found.");
            }

            // Chụp lại giá trị cũ để ghi audit
            var originalValuesJson = JsonSerializer.Serialize(_mapper.Map<CvaStandardDto>(standard)); // Map sang DTO để chỉ lấy các trường cần thiết

            // Áp dụng các thay đổi từ DTO vào entity
            // Sử dụng ?? để chỉ cập nhật nếu giá trị trong DTO không null
            standard.StandardName = request.UpdateData.StandardName ?? standard.StandardName;
            standard.VehicleType = request.UpdateData.VehicleType ?? standard.VehicleType;
            standard.ConversionRate = request.UpdateData.ConversionRate ?? standard.ConversionRate;
            standard.MinDistanceRequirement = request.UpdateData.MinDistanceRequirement ?? standard.MinDistanceRequirement;
            standard.EffectiveDate = request.UpdateData.EffectiveDate ?? standard.EffectiveDate;
            standard.EndDate = request.UpdateData.EndDate; // Cho phép set null
            standard.IsActive = request.UpdateData.IsActive ?? standard.IsActive;
            standard.LastModifiedAt = DateTime.UtcNow; // Cập nhật thời gian sửa đổi

            // Repository UpdateAsync chỉ đánh dấu là Modified, không cần gọi
            // await _standardRepository.UpdateAsync(standard); // Không cần thiết nếu context theo dõi thay đổi

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Successfully updated CVA Standard ID: {StandardId}", standard.Id);

            // Ghi Audit Log
            var newValuesJson = JsonSerializer.Serialize(request.UpdateData); // Log những gì được gửi lên để update
            var auditCommand = new CreateAuditReportCommand(new AuditReportCreateDto
            {
                EntityType = nameof(Domain.Entities.CVAStandard),
                EntityId = standard.Id,
                Action = "Updated",
                OriginalValuesJson = originalValuesJson,
                NewValuesJson = newValuesJson
            });
            _ = _mediator.Send(auditCommand, cancellationToken);


            return _mapper.Map<CvaStandardDto>(standard); // Trả về entity đã cập nhật
        }
    }
}