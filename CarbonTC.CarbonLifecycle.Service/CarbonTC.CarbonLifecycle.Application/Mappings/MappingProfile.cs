using AutoMapper;
using CarbonTC.CarbonLifecycle.Application.DTOs;
using CarbonTC.CarbonLifecycle.Domain.Entities;
using CarbonTC.CarbonLifecycle.Domain.Enums;

namespace CarbonTC.CarbonLifecycle.Application.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // --- Ánh xạ EVJourney ---
            CreateMap<EVJourney, EvJourneyResponseDto>()
                // Ánh xạ UserId (Entity) sang OwnerId (DTO)
                .ForMember(dest => dest.OwnerId,
                           opt => opt.MapFrom(src => src.UserId))

                // Ánh xạ CO2EstimateKg (Entity) sang CalculatedCarbonCredits (DTO)
                .ForMember(dest => dest.CalculatedCarbonCredits,
                           opt => opt.MapFrom(src => src.CO2EstimateKg))

                // Chuyển Enum (Entity) sang string (DTO)
                .ForMember(dest => dest.Status,
                           opt => opt.MapFrom(src => src.Status.ToString()));


            // --- Ánh xạ JourneyBatch ---
            CreateMap<JourneyBatch, JourneyBatchDto>()
                // Ánh xạ UserId (Entity) sang OwnerId (DTO)
                .ForMember(dest => dest.OwnerId,
                           opt => opt.MapFrom(src => src.UserId))

                // Ánh xạ TotalCO2SavedKg (Entity) sang TotalCarbonCredits (DTO)
                .ForMember(dest => dest.TotalCarbonCredits,
                           opt => opt.MapFrom(src => src.TotalCO2SavedKg))



                // Chuyển Enum (Entity) sang string (DTO)
                .ForMember(dest => dest.Status,
                           opt => opt.MapFrom(src => src.Status.ToString()))

                // Tự động ánh xạ ICollection<EVJourney> sang List<EvJourneyResponseDto>
                // (Vì chúng ta đã định nghĩa map EVJourney -> EvJourneyResponseDto ở trên)
                .ForMember(dest => dest.Journeys,
                           opt => opt.MapFrom(src => src.EVJourneys));


            // (Bạn có thể thêm các ánh xạ cho DTOs -> Commands ở đây nếu cần,
            // nhưng thường việc này sẽ được xử lý trong Handlers)
                // --- Ánh xạ EVJourney ---
                CreateMap<EVJourney, EvJourneyResponseDto>()
                    // ... (các map cũ của bạn) ...
                    .ForMember(dest => dest.Status,
                               opt => opt.MapFrom(src => src.Status.ToString()));


                // --- Ánh xạ JourneyBatch ---
                CreateMap<JourneyBatch, JourneyBatchDto>()
                    // ... (các map cũ của bạn) ...
                    .ForMember(dest => dest.Journeys,
                               opt => opt.MapFrom(src => src.EVJourneys));


                // --- BỔ SUNG ÁNH XẠ MỚI CHO CVASTANDARD ---
                CreateMap<CVAStandard, CvaStandardDto>();
        }
    }
}