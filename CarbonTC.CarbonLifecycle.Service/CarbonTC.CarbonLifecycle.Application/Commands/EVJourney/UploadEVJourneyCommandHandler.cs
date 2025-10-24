using AutoMapper;
using CarbonTC.CarbonLifecycle.Application.DTOs;
using CarbonTC.CarbonLifecycle.Application.Services;
using CarbonTC.CarbonLifecycle.Domain.Entities;
using CarbonTC.CarbonLifecycle.Domain.Repositories;
using CarbonTC.CarbonLifecycle.Domain.Enums;
using MediatR;
using Microsoft.Extensions.Logging;

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
                throw new Exception("User is not authenticated."); // Cần Exception chi tiết hơn
            }

            // 1. Lấy tiêu chuẩn tính toán
            var standard = await _standardRepository
                .GetActiveStandardByVehicleTypeAsync(request.JourneyData.VehicleModel);

            if (standard == null)
            {
                throw new Exception($"No active CVA standard found for vehicle type '{request.JourneyData.VehicleModel}'.");
            }

            // 2. Tính toán CO2
            decimal co2Saved = (decimal)request.JourneyData.DistanceKm * standard.ConversionRate;

            // --- BẮT ĐẦU LOGIC TÌM HOẶC TẠO BATCH ---
            CarbonTC.CarbonLifecycle.Domain.Entities.JourneyBatch batchToUse;

            // 3. Tìm lô Pending hiện có của người dùng
            var existingPendingBatch = await _batchRepository.GetPendingBatchByOwnerIdAsync(ownerId);

            if (existingPendingBatch != null)
            {
                // 3a. Sử dụng lô hiện có
                batchToUse = existingPendingBatch;
                batchToUse.TotalDistanceKm += request.JourneyData.DistanceKm;
                batchToUse.TotalCO2SavedKg += co2Saved;
                batchToUse.NumberOfJourneys += 1;
                batchToUse.LastModifiedAt = DateTime.UtcNow; // Cập nhật thời gian sửa đổi lô
                // Đánh dấu lô này là đã sửa đổi (Repository sẽ làm việc này khi gọi Update)
                await _batchRepository.UpdateAsync(batchToUse); // Chỉ đánh dấu thay đổi trong context
            }
            else
            {
                // 3b. Tạo lô mới nếu không tìm thấy
                batchToUse = new CarbonTC.CarbonLifecycle.Domain.Entities.JourneyBatch
                {
                    Id = Guid.NewGuid(),
                    UserId = ownerId,
                    CreationTime = DateTime.UtcNow,
                    Status = JourneyBatchStatus.Pending,
                    TotalDistanceKm = request.JourneyData.DistanceKm,
                    TotalCO2SavedKg = co2Saved,
                    NumberOfJourneys = 1,
                    EVJourneys = new List<CarbonTC.CarbonLifecycle.Domain.Entities.EVJourney>() // Khởi tạo danh sách nếu cần
                };
                // Thêm lô mới vào context
                await _batchRepository.AddAsync(batchToUse); // Chỉ thêm vào context
            }
            // --- KẾT THÚC LOGIC TÌM HOẶC TẠO BATCH ---

            // 4. Tạo Entity EVJourney và gán JourneyBatchId
            var journey = new CarbonTC.CarbonLifecycle.Domain.Entities.EVJourney
            {
                Id = Guid.NewGuid(),
                JourneyBatchId = batchToUse.Id, 
                UserId = ownerId,
                StartTime = request.JourneyData.StartTime,
                EndTime = request.JourneyData.EndTime,
                DistanceKm = request.JourneyData.DistanceKm,
                VehicleType = request.JourneyData.VehicleModel,
                CO2EstimateKg = co2Saved,
                Status = JourneyStatus.Pending, // Enum từ file EVJourney.cs
                Origin = "N/A", // Bạn có thể thêm vào DTO
                Destination = "N/A"
            };

            // 5. Thêm hành trình vào context
            await _journeyRepository.AddAsync(journey); // Chỉ thêm vào context

            // 6. Lưu tất cả thay đổi (hành trình mới + lô mới/cập nhật) vào DB
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // 7. Map kết quả và trả về (vẫn trả về DTO của hành trình)
            return _mapper.Map<EvJourneyResponseDto>(journey);

            await _journeyRepository.AddAsync(journey);
            await _unitOfWork.SaveChangesAsync(cancellationToken); // Dùng IUnitOfWork

            return _mapper.Map<EvJourneyResponseDto>(journey);
        }
    }
}