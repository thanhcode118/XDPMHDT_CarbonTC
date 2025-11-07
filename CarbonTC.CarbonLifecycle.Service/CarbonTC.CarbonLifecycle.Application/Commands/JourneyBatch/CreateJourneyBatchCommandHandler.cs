using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using CarbonTC.CarbonLifecycle.Application.DTOs;
using CarbonTC.CarbonLifecycle.Application.Services;
using CarbonTC.CarbonLifecycle.Domain.Entities;
using CarbonTC.CarbonLifecycle.Domain.Repositories;
using CarbonTC.CarbonLifecycle.Domain.Enums;
using MediatR;
using System.Threading;

namespace CarbonTC.CarbonLifecycle.Application.Commands.JourneyBatch
{
    public class CreateJourneyBatchCommandHandler : IRequestHandler<CreateJourneyBatchCommand, JourneyBatchDto>
    {
        private readonly IJourneyBatchRepository _batchRepository;
        private readonly IEVJourneyRepository _journeyRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IIdentityService _identityService;

        public CreateJourneyBatchCommandHandler(
            IJourneyBatchRepository batchRepository,
            IEVJourneyRepository journeyRepository,
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IIdentityService identityService)
        {
            _batchRepository = batchRepository;
            _journeyRepository = journeyRepository;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _identityService = identityService;
        }

        public async Task<JourneyBatchDto> Handle(CreateJourneyBatchCommand request, CancellationToken cancellationToken)
        {
            var ownerId = _identityService.GetUserId();
            if (string.IsNullOrEmpty(ownerId))
            {
                throw new UnauthorizedAccessException("User is not authenticated.");
            }

            // 1. Lấy hành trình (Dùng hàm đã xác nhận)
            var journeys = (await _journeyRepository
                .GetByIdsAndOwnerAsync(request.BatchData.JourneyIds, ownerId))
                .ToList();

            // 2. Kiểm tra nghiệp vụ
            if (journeys.Count != request.BatchData.JourneyIds.Count)
            {
                throw new KeyNotFoundException("Some journeys not found or do not belong to user.");
            }
            if (journeys.Any(j => j.Status != JourneyStatus.Pending))
            {
                throw new InvalidOperationException("Only journeys with 'Pending' status can be batched.");
            }

            // 3. Tạo Batch - SỬ DỤNG FACTORY METHOD
            var newBatch = CarbonTC.CarbonLifecycle.Domain.Entities.JourneyBatch.CreateFromJourneys(ownerId, journeys);

            // 4. Cập nhật trạng thái và gán BatchId cho các Journeys (sử dụng Domain Behavior Method)
            foreach (var journey in journeys)
            {
                // AssignToBatch sẽ chuyển trạng thái của Journey từ Pending sang Completed
                journey.AssignToBatch(newBatch.Id);
            }

            await _batchRepository.AddAsync(newBatch);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return _mapper.Map<JourneyBatchDto>(newBatch);
        }
    }
}