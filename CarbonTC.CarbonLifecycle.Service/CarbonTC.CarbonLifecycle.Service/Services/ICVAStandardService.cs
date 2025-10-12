using CarbonTC.CarbonLifecycle.Service.Common.ApiResponse;
using CarbonTC.CarbonLifecycle.Service.Models.DTOs;

namespace CarbonTC.CarbonLifecycle.Service.Services
{
    public interface ICVAStandardService
    {
        Task<ApiResponse<IEnumerable<CVAStandardDto>>> GetAllStandardsAsync();
        Task<ApiResponse<CVAStandardDto>> GetStandardByIdAsync(Guid standardId);
        Task<ApiResponse<CVAStandardDto>> CreateStandardAsync(CVAStandardCreateUpdateDto createDto);
        Task<ApiResponse<CVAStandardDto>> UpdateStandardAsync(Guid standardId, CVAStandardCreateUpdateDto updateDto);
        Task<ApiResponse<bool>> DeleteStandardAsync(Guid standardId);
    }
}