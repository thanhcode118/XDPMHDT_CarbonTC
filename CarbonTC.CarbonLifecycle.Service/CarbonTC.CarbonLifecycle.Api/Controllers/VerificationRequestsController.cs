using CarbonTC.CarbonLifecycle.Application.Commands.VerificationRequest;
using CarbonTC.CarbonLifecycle.Application.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace CarbonTC.CarbonLifecycle.Api.Controllers
{
    // DTO đơn giản để nhận JourneyBatchId từ body của request
    public record SubmitRequestDto(Guid JourneyBatchId);


    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Yêu cầu đăng nhập cho cả class
    public class VerificationRequestsController : BaseApiController
    {
        private readonly ILogger<VerificationRequestsController> _logger;

        public VerificationRequestsController(ILogger<VerificationRequestsController> logger)
        {
            _logger = logger;
        }

        /// Gửi một lô (Batch) để yêu cầu xác minh
        /// Endpoint này sẽ thay đổi trạng thái của Batch thành 'SubmittedForVerification'
        /// và tạo một 'VerificationRequest' mới.
        /// Chỉ chủ sở hữu của Batch mới có thể gửi yêu cầu.
        [HttpPost]
        [Authorize(Roles = "EVOwner")] // Phân quyền cho phương thức
        [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
        [ProducesResponseType(typeof(ApiResponse<object>), 500)]
        public async Task<IActionResult> SubmitForVerification([FromBody] SubmitRequestDto requestDto)
        {
            _logger.LogInformation("Attempting to submit journey batch {JourneyBatchId} for verification", requestDto.JourneyBatchId);

            var command = new SubmitVerificationRequestCommand(requestDto.JourneyBatchId);
            var result = await Mediator.Send(command);

            return Ok(ApiResponse<bool>.SuccessResponse(result, "Batch submitted for verification successfully."));
        }

        // GHI CHÚ:
        // Khi bạn thêm chức năng duyệt/từ chối, hãy thêm chúng ở đây:
        /*
        [HttpPost("{id}/approve")]
        [Authorize(Roles = "CVA")] // <-- Chỉ CVA mới được duyệt
        public async Task<IActionResult> ApproveRequest(Guid id)
        {
            // ... (code gọi command duyệt)
        }

        [HttpPost("{id}/reject")]
        [Authorize(Roles = "CVA")] // <-- Chỉ CVA mới được từ chối
        public async Task<IActionResult> RejectRequest(Guid id, [FromBody] string reason)
        {
            // ... (code gọi command từ chối)
        }
        */
    }
}