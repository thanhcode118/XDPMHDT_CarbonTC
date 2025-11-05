using AutoMapper;
using CarbonTC.CarbonLifecycle.Application.DTOs;
using CarbonTC.CarbonLifecycle.Application.Services;
using CarbonTC.CarbonLifecycle.Domain.Entities;
using CarbonTC.CarbonLifecycle.Domain.Repositories;
using CarbonTC.CarbonLifecycle.Domain.Enums;
using MediatR;
using Microsoft.Extensions.Logging;
using CarbonTC.CarbonLifecycle.Application.Services;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace CarbonTC.CarbonLifecycle.Application.Commands.EVJourney
{
    public class UploadEVJourneyCommandHandler : IRequestHandler<UploadEVJourneyCommand, EvJourneyResponseDto>
    {
        private readonly IEVJourneyRepository _journeyRepository;
        private readonly ICVAStandardRepository _standardRepository;
        private readonly IJourneyBatchRepository _batchRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IIdentityService _identityService;


        public UploadEVJourneyCommandHandler(
            IEVJourneyRepository journeyRepository,
            ICVAStandardRepository standardRepository,
            IJourneyBatchRepository batchRepository,
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IIdentityService identityService)
        {
            _journeyRepository = journeyRepository;
            _standardRepository = standardRepository;
            _batchRepository = batchRepository;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _identityService = identityService;
        }

        public async Task<EvJourneyResponseDto> Handle(UploadEVJourneyCommand request, CancellationToken cancellationToken)
        {
            var ownerId = _identityService.GetUserId();
            if (string.IsNullOrEmpty(ownerId))
            {
                throw new Exception("User is not authenticated.");
            }

            // 1. Lấy tiêu chuẩn tính toán
            var standard = await _standardRepository
                .GetActiveStandardByVehicleTypeAsync(request.JourneyData.VehicleModel);

            if (standard == null)
            {
                throw new Exception($"No active CVA standard found for vehicle type '{request.JourneyData.VehicleModel}'.");
            }

            // 2. Tính toán CO2
            decimal co2Saved = request.JourneyData.DistanceKm * standard.ConversionRate;

            // --- BẮT ĐẦU LOGIC TÌM HOẶC TẠO BATCH ---
            CarbonTC.CarbonLifecycle.Domain.Entities.JourneyBatch batchToUse;

            // 3. Tìm lô Pending hiện có của người dùng
            var existingPendingBatch = await _batchRepository.GetPendingBatchByOwnerIdAsync(ownerId);

            if (existingPendingBatch != null)
            {
                // 3a. Sử dụng lô hiện có
                batchToUse = existingPendingBatch;
                // Gọi phương thức Domain để cập nhật tổng
                batchToUse.AddJourneySummary(request.JourneyData.DistanceKm, co2Saved);
                await _batchRepository.UpdateAsync(batchToUse);
            }
            else
            {
                // 3b. Tạo lô mới - SỬ DỤNG FACTORY METHOD
                batchToUse = CarbonTC.CarbonLifecycle.Domain.Entities.JourneyBatch.Create(ownerId);

                // Cập nhật thông tin ban đầu thông qua AddJourneySummary
                batchToUse.AddJourneySummary(request.JourneyData.DistanceKm, co2Saved);

                await _batchRepository.AddAsync(batchToUse);
            }
            // --- KẾT THÚC LOGIC TÌM HOẶC TẠO BATCH ---

            // 4. Tạo Entity EVJourney - SỬ DỤNG FACTORY METHOD
            var journey = CarbonTC.CarbonLifecycle.Domain.Entities.EVJourney.Create(
                journeyBatchId: batchToUse.Id,
                userId: ownerId,
                distanceKm: request.JourneyData.DistanceKm,
                startTime: request.JourneyData.StartTime,
                endTime: request.JourneyData.EndTime,
                vehicleType: request.JourneyData.VehicleModel,
                co2EstimateKg: co2Saved,
                origin: request.JourneyData.Origin ?? "N/A",
                destination: request.JourneyData.Destination ?? "N/A"
            );

            // 5. Thêm hành trình vào context
            await _journeyRepository.AddAsync(journey);

            // 6. Lưu tất cả thay đổi
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // 7. Map kết quả và trả về
            return _mapper.Map<EvJourneyResponseDto>(journey);
        }
    }
}