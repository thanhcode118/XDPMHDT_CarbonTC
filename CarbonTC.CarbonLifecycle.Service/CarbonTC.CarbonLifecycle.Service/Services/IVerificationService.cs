using CarbonTC.CarbonLifecycle.Service.Common.ApiResponse;
using CarbonTC.CarbonLifecycle.Service.Models.DTOs;

namespace CarbonTC.CarbonLifecycle.Service.Services
{
    public interface IVerificationService
    {
        Task<ApiResponse<VerificationRequestResponseDto>> CreateRequestAsync(VerificationRequestCreateDto createDto);
        Task<ApiResponse<VerificationRequestResponseDto>> GetRequestByIdAsync(Guid requestId);
        Task<ApiResponse<IEnumerable<VerificationRequestResponseDto>>> GetPendingRequestsForCvaAsync(Guid cvaUserId);
        Task<ApiResponse<bool>> ReviewRequestAsync(Guid requestId, VerificationRequestReviewDto reviewDto, Guid cvaUserId);
    }
}