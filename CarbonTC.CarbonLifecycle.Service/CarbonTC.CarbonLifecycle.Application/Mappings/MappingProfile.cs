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

                // --- BỔ SUNG ÁNH XẠ MỚI CHO CARBONCREDITS ---
                CreateMap<CarbonCredit, CarbonCreditDto>();

            // DTO -> Entity (cho Commands)
            CreateMap<CVAStandardCreateDto, CVAStandard>(); // Add Command
            CreateMap<CVAStandardUpdateDto, CVAStandard>()  // Update Command (cần xử lý null trong handler)
                 .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null)); // Chỉ map các thuộc tính không null từ DTO
            CreateMap<AuditReportCreateDto, AuditReport>(); // Create AuditReport Command

            // Entity -> DTO (cho Queries và Command Results)
            CreateMap<VerificationRequest, VerificationRequestSummaryDto>(); // Query GetVerificationRequestsForCVA
            CreateMap<VerificationRequest, VerificationRequestDto>() // Query GetVerificationRequestById & Review Command Result
                .ForMember(dest => dest.AppliedStandard, opt => opt.MapFrom(src => src.CvaStandard)) // Map navigation property
                .ForMember(dest => dest.IssuedCredits, opt => opt.MapFrom(src => src.CarbonCredits)); // Map collection
            CreateMap<AuditReport, AuditReportCreateDto>(); // Có thể cần DTO kết quả riêng nếu khác CreateDto

            // Đảm bảo ánh xạ cho CarbonCredit sang CarbonCreditDto đã có hoặc thêm vào nếu chưa:
            CreateMap<CarbonCredit, CarbonCreditDto>(); // Cần cho VerificationRequestDto
        }
    }
}