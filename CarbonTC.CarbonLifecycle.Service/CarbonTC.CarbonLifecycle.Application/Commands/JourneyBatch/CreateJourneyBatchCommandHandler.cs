﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using CarbonTC.CarbonLifecycle.Application.DTOs;
using CarbonTC.CarbonLifecycle.Application.Services;
using CarbonTC.CarbonLifecycle.Domain.Entities;
using CarbonTC.CarbonLifecycle.Domain.Repositories;
using CarbonTC.CarbonLifecycle.Domain.Enums; // Dùng Enums
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
                throw new Exception("User is not authenticated.");
            }

            // 1. Lấy hành trình (Dùng hàm đã xác nhận)
            var journeys = (await _journeyRepository
                .GetByIdsAndOwnerAsync(request.BatchData.JourneyIds, ownerId))
                .ToList();

            // 2. Kiểm tra nghiệp vụ
            if (journeys.Count != request.BatchData.JourneyIds.Count)
            {
                throw new Exception("Some journeys not found or do not belong to user.");
            }
            if (journeys.Any(j => j.Status != JourneyStatus.Pending))
            {
                throw new Exception("Only journeys with 'Pending' status can be batched.");
            }

            // 3. Tạo Batch
            var newBatch = new CarbonTC.CarbonLifecycle.Domain.Entities.JourneyBatch
            {
                Id = Guid.NewGuid(),
                UserId = ownerId,
                CreationTime = DateTime.UtcNow,
                Status = JourneyBatchStatus.Pending, // Enum bạn đã cung cấp
                EVJourneys = journeys,
                TotalDistanceKm = journeys.Sum(j => j.DistanceKm),
                TotalCO2SavedKg = journeys.Sum(j => j.CO2EstimateKg),
                NumberOfJourneys = journeys.Count
            };

            await _batchRepository.AddAsync(newBatch);
            await _unitOfWork.SaveChangesAsync(cancellationToken); // Dùng IUnitOfWork

            return _mapper.Map<JourneyBatchDto>(newBatch);
        }
    }
}
