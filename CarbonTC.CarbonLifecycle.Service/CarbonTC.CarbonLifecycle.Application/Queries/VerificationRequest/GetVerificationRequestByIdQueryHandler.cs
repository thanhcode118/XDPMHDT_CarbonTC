// File: CarbonTC.CarbonLifecycle.Application/Queries/VerificationRequest/GetVerificationRequestByIdQueryHandler.cs
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Logging;
using CarbonTC.CarbonLifecycle.Domain.Repositories;
using CarbonTC.CarbonLifecycle.Application.DTOs;

namespace CarbonTC.CarbonLifecycle.Application.Queries.VerificationRequest
{
    public class GetVerificationRequestByIdQueryHandler : IRequestHandler<GetVerificationRequestByIdQuery, VerificationRequestDto?>
    {
        private readonly IVerificationRequestRepository _verificationRequestRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<GetVerificationRequestByIdQueryHandler> _logger;

        public GetVerificationRequestByIdQueryHandler(
            IVerificationRequestRepository verificationRequestRepository,
            IMapper mapper,
            ILogger<GetVerificationRequestByIdQueryHandler> logger)
        {
            _verificationRequestRepository = verificationRequestRepository;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<VerificationRequestDto?> Handle(GetVerificationRequestByIdQuery request, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Getting details for VerificationRequest ID: {VerificationRequestId}", request.VerificationRequestId);

            // Repository GetByIdAsync đã include JourneyBatch, CvaStandard, CarbonCredits rồi
            var verificationRequest = await _verificationRequestRepository.GetByIdAsync(request.VerificationRequestId);

            if (verificationRequest == null)
            {
                _logger.LogWarning("VerificationRequest not found: {VerificationRequestId}", request.VerificationRequestId);
                return null;
            }

            // Cần đảm bảo MappingProfile xử lý các navigation properties (JourneyBatch, CvaStandard, CarbonCredits)
            return _mapper.Map<VerificationRequestDto>(verificationRequest);
        }
    }
}