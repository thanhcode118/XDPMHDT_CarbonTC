using AutoMapper;
using CarbonTC.CarbonLifecycle.Service.Models.DTOs;
using CarbonTC.CarbonLifecycle.Service.Models.Entities; 
using CarbonTC.CarbonLifecycle.Service.Models.Enums;   

namespace CarbonTC.CarbonLifecycle.Service.Mapping
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // Ánh xạ từ Entity sang DTO
            CreateMap<EVJourney, EvJourneyResponseDto>();
            CreateMap<JourneyBatch, JourneyBatchDto>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));

            CreateMap<VerificationRequest, VerificationRequestResponseDto>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));

            CreateMap<CVAStandard, CVAStandardDto>();
            CreateMap<AuditReport, AuditReportDto>();

            CreateMap<CarbonCredit, CarbonCreditDto>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));


            // Ánh xạ từ DTO sang Entity (thường dùng cho các thao tác Create/Update)
            CreateMap<CVAStandardCreateUpdateDto, CVAStandard>();
            CreateMap<AuditReportCreateDto, AuditReport>();
            CreateMap<VerificationRequestCreateDto, VerificationRequest>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => VerificationRequestStatus.Pending))
                .ForMember(dest => dest.SubmittedAt, opt => opt.MapFrom(src => DateTime.UtcNow));
        }
    }
}