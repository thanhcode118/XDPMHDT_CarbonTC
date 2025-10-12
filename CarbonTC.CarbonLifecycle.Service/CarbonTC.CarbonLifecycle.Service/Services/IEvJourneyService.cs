using CarbonTC.CarbonLifecycle.Service.Common.ApiResponse;
using CarbonTC.CarbonLifecycle.Service.Models.DTOs;

namespace CarbonTC.CarbonLifecycle.Service.Services
{
    public interface IEvJourneyService
    {
        Task<ApiResponse<IEnumerable<EvJourneyResponseDto>>> UploadAndProcessJourneysAsync(EvJourneyUploadDto uploadDto);
        Task<ApiResponse<IEnumerable<EvJourneyResponseDto>>> GetJourneysByOwnerAsync(Guid ownerId);
        Task<ApiResponse<JourneyBatchDto>> BatchJourneysAsync(Guid ownerId, List<Guid> journeyIds);
    }
}