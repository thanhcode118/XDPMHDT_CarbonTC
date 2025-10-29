// File: CarbonTC.CarbonLifecycle.Application/Commands/CVAStandard/AddCVAStandardCommandHandler.cs
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using CarbonTC.CarbonLifecycle.Domain.Repositories;
using CarbonTC.CarbonLifecycle.Domain.Entities; // Cần entity CVAStandard
using CarbonTC.CarbonLifecycle.Application.DTOs;
using CarbonTC.CarbonLifecycle.Application.Commands.AuditReport;

namespace CarbonTC.CarbonLifecycle.Application.Commands.CVAStandard
{
    public class AddCVAStandardCommandHandler : IRequestHandler<AddCVAStandardCommand, CvaStandardDto>
    {
        private readonly ICVAStandardRepository _standardRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ILogger<AddCVAStandardCommandHandler> _logger;
        private readonly IMediator _mediator;

        public AddCVAStandardCommandHandler(
            ICVAStandardRepository standardRepository,
            IUnitOfWork unitOfWork,
            IMapper mapper,
            ILogger<AddCVAStandardCommandHandler> logger,
            IMediator mediator)
        {
            _standardRepository = standardRepository;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _logger = logger;
            _mediator = mediator;
        }

        public async Task<CvaStandardDto> Handle(AddCVAStandardCommand request, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Attempting to add new CVA Standard: {StandardName}", request.StandardData.StandardName);

            // Kiểm tra trùng lặp (ví dụ theo StandardName hoặc VehicleType + EffectiveDate) nếu cần
            // var existing = await _standardRepository.GetByNameAsync(request.StandardData.StandardName);
            // if (existing != null) { throw new InvalidOperationException(...); }

            var standard = _mapper.Map<Domain.Entities.CVAStandard>(request.StandardData);
            standard.Id = Guid.NewGuid(); // Đảm bảo ID mới

            await _standardRepository.AddAsync(standard);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Successfully added CVA Standard ID: {StandardId}", standard.Id);

            // Ghi Audit Log
            var auditCommand = new CreateAuditReportCommand(new AuditReportCreateDto
            {
                EntityType = nameof(Domain.Entities.CVAStandard),
                EntityId = standard.Id,
                Action = "Created",
                NewValuesJson = JsonSerializer.Serialize(request.StandardData) // Log dữ liệu DTO đã dùng để tạo
            });
            _ = _mediator.Send(auditCommand, cancellationToken);

            return _mapper.Map<CvaStandardDto>(standard);
        }
    }
}