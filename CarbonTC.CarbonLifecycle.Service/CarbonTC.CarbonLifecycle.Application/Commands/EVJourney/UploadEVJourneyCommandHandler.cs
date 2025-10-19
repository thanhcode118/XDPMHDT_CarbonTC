using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using CarbonTC.CarbonLifecycle.Application.DTOs;
using CarbonTC.CarbonLifecycle.Application.Services; // Dùng IIdentityService
using CarbonTC.CarbonLifecycle.Domain.Entities;
using CarbonTC.CarbonLifecycle.Domain.Repositories; // Dùng IRepository và IUnitOfWork
using CarbonTC.CarbonLifecycle.Domain.Enums; // Dùng Enums
using MediatR;
using System.Threading;

namespace CarbonTC.CarbonLifecycle.Application.Commands.EVJourney
{
    public class UploadEVJourneyCommandHandler : IRequestHandler<UploadEVJourneyCommand, EvJourneyResponseDto>
    {
        private readonly IEVJourneyRepository _journeyRepository;
        private readonly ICVAStandardRepository _standardRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IIdentityService _identityService;

        public UploadEVJourneyCommandHandler(
            IEVJourneyRepository journeyRepository,
            ICVAStandardRepository standardRepository,
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IIdentityService identityService)
        {
            _journeyRepository = journeyRepository;
            _standardRepository = standardRepository;
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

            var journey = new CarbonTC.CarbonLifecycle.Domain.Entities.EVJourney
            {
                Id = Guid.NewGuid(),
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

            await _journeyRepository.AddAsync(journey);
            await _unitOfWork.SaveChangesAsync(cancellationToken); // Dùng IUnitOfWork

            return _mapper.Map<EvJourneyResponseDto>(journey);
        }
    }
}