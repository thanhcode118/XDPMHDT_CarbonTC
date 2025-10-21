using CarbonTC.CarbonLifecycle.Application.Commands.EVJourney;
using CarbonTC.CarbonLifecycle.Application.Commands.JourneyBatch;
using CarbonTC.CarbonLifecycle.Application.Common;
using CarbonTC.CarbonLifecycle.Application.DTOs;
using CarbonTC.CarbonLifecycle.Application.Queries.EVJourney;
using CarbonTC.CarbonLifecycle.Application.Services;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace CarbonTC.CarbonLifecycle.Api.Controllers
{
    // Kế thừa từ BaseApiController
    public class EvJourneysController : BaseApiController
    {
        private readonly ILogger<EvJourneysController> _logger;
        private readonly IIdentityService _identityService;

        public EvJourneysController(ILogger<EvJourneysController> logger, IIdentityService identityService)
        {
            _logger = logger;
            _identityService = identityService;
        }

        /// Tải lên một hành trình EV (EV Journey)
        /// Endpoint này nhận thông tin của một hành trình và tạo mới.
        /// OwnerId sẽ tự động được lấy từ thông tin xác thực của người dùng.
        [HttpPost("upload")]
        [ProducesResponseType(typeof(ApiResponse<EvJourneyResponseDto>), 200)]
        [ProducesResponseType(typeof(ApiResponse<object>), 500)]
        public async Task<IActionResult> UploadJourney([FromBody] EvJourneyUploadDto uploadDto)
        {
            _logger.LogInformation("Attempting to upload new EV journey");
            var command = new UploadEVJourneyCommand(uploadDto);
            var result = await Mediator.Send(command);

            return Ok(ApiResponse<EvJourneyResponseDto>.SuccessResponse(result, "Journey uploaded successfully"));
        }

        /// Lấy danh sách hành trình theo Owner ID
        /// Lấy tất cả hành trình thuộc về một Owner (User) ID cụ thể.
        /// Lưu ý: Endpoint này hiện cho phép truy vấn ID của bất kỳ ai.
        [HttpGet("{ownerId}")]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<EvJourneyResponseDto>>), 200)]
        [ProducesResponseType(typeof(ApiResponse<object>), 500)]
        public async Task<IActionResult> GetJourneysByOwner(string ownerId)
        {
            _logger.LogInformation("Getting journeys for ownerId: {OwnerId}", ownerId);
            var query = new GetEVJourneysByOwnerIdQuery(ownerId);
            var result = await Mediator.Send(query);

            return Ok(ApiResponse<IEnumerable<EvJourneyResponseDto>>.SuccessResponse(result, $"Found {result.Count()} journeys"));
        }

        /// Lấy chi tiết một hành trình
        /// Lấy thông tin chi tiết của một hành trình (journeyId).
        /// Endpoint này bảo mật, chỉ trả về hành trình nếu nó thuộc về người dùng đang đăng nhập.
        [HttpGet("journey/{journeyId}")]
        [ProducesResponseType(typeof(ApiResponse<EvJourneyResponseDto>), 200)]
        [ProducesResponseType(typeof(ApiResponse<object>), 404)]
        [ProducesResponseType(typeof(ApiResponse<object>), 500)]
        public async Task<IActionResult> GetJourneyById(Guid journeyId)
        {
            var ownerId = _identityService.GetUserId();
            if (string.IsNullOrEmpty(ownerId))
            {
                return Unauthorized(ApiResponse<object>.FailureResponse("User not authenticated.", ""));
            }

            _logger.LogInformation("Getting journey details for journeyId: {JourneyId}", journeyId);
            var query = new GetEVJourneyByIdQuery(journeyId, ownerId);
            var result = await Mediator.Send(query);

            if (result == null)
            {
                _logger.LogWarning("Journey not found or user {OwnerId} does not have access to journey {JourneyId}", ownerId, journeyId);
                return NotFound(ApiResponse<object>.FailureResponse("Journey not found or access denied.", ""));
            }

            return Ok(ApiResponse<EvJourneyResponseDto>.SuccessResponse(result));
        }

        /// Gộp nhiều hành trình thành một lô (Batch)
        /// Tạo một lô mới từ danh sách các ID hành trình (journeyIds).
        /// Chỉ các hành trình 'Pending' thuộc về người dùng đang đăng nhập mới được gộp.
        [HttpPost("batch")]
        [ProducesResponseType(typeof(ApiResponse<JourneyBatchDto>), 200)]
        [ProducesResponseType(typeof(ApiResponse<object>), 500)]
        public async Task<IActionResult> CreateBatch([FromBody] JourneyBatchCreateDto batchDto)
        {
            _logger.LogInformation("Attempting to create a new journey batch with {Count} journeys", batchDto.JourneyIds.Count);
            var command = new CreateJourneyBatchCommand(batchDto);
            var result = await Mediator.Send(command);

            return Ok(ApiResponse<JourneyBatchDto>.SuccessResponse(result, "Journey batch created successfully"));
        }
    }
}