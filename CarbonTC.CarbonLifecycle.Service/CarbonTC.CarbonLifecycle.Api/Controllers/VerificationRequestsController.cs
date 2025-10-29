// File: CarbonTC.CarbonLifecycle.Api/Controllers/VerificationRequestsController.cs
using CarbonTC.CarbonLifecycle.Application.Commands.VerificationRequest;
using CarbonTC.CarbonLifecycle.Application.Common;
using CarbonTC.CarbonLifecycle.Application.Queries.VerificationRequest;
using CarbonTC.CarbonLifecycle.Application.DTOs;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.Linq;


namespace CarbonTC.CarbonLifecycle.Api.Controllers
{
    // DTO đơn giản để nhận JourneyBatchId từ body của request
    public record SubmitRequestDto(Guid JourneyBatchId);


    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Yêu cầu đăng nhập cho cả class
    public class VerificationRequestsController : BaseApiController // Kế thừa BaseApiController
    {
        private readonly ILogger<VerificationRequestsController> _logger;

        // Constructor gọi base constructor và inject ILogger
        public VerificationRequestsController(ILogger<VerificationRequestsController> logger) : base()
        {
            _logger = logger;
        }

        /// <summary>
        /// Gửi một lô (Batch) để yêu cầu xác minh.
        /// Chỉ chủ sở hữu của Batch mới có thể gửi yêu cầu.
        /// </summary>
        /// <param name="requestDto">DTO chứa JourneyBatchId.</param>
        /// <returns>Kết quả thực hiện.</returns>
        [HttpPost("submit")]
        [Authorize(Roles = "EVOwner")]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> SubmitForVerification([FromBody] SubmitRequestDto requestDto)
        {
            _logger.LogInformation("Attempting to submit journey batch {JourneyBatchId} for verification", requestDto.JourneyBatchId);
            var command = new SubmitVerificationRequestCommand(requestDto.JourneyBatchId);
            try
            {
                var result = await Mediator.Send(command);
                // Sử dụng ApiResponse từ Application.Common
                return Ok(ApiResponse<bool>.SuccessResponse(result, "Batch submitted for verification successfully."));
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Failed to submit batch: {Message}", ex.Message);
                return NotFound(ApiResponse<object>.FailureResponse(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Failed to submit batch due to invalid state: {Message}", ex.Message);
                return BadRequest(ApiResponse<object>.FailureResponse(ex.Message));
            }
        }

        /// <summary>
        /// Review (duyệt/từ chối) một yêu cầu xác minh.
        /// Endpoint này dành cho vai trò CVA.
        /// </summary>
        /// <param name="reviewDto">DTO chứa thông tin review.</param>
        /// <returns>Kết quả review và thông tin VerificationRequest đã cập nhật.</returns>
        [HttpPost("review")]
        [Authorize(Roles = "CVA")]
        [ProducesResponseType(typeof(ApiResponse<VerificationRequestDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> ReviewRequest([FromBody] VerificationRequestReviewDto reviewDto)
        {
            _logger.LogInformation("Attempting to review verification request {VerificationRequestId}", reviewDto.VerificationRequestId);
            var command = new ReviewVerificationRequestCommand(reviewDto);
            try
            {
                var result = await Mediator.Send(command);
                return Ok(ApiResponse<VerificationRequestDto>.SuccessResponse(result, "Verification request reviewed successfully."));
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid data provided for review: {Message}", ex.Message);
                return BadRequest(ApiResponse<object>.FailureResponse("Invalid review data.", new List<string> { ex.Message }));
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Resource not found during review: {Message}", ex.Message);
                return NotFound(ApiResponse<object>.FailureResponse(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid operation during review: {Message}", ex.Message);
                return BadRequest(ApiResponse<object>.FailureResponse(ex.Message));
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized review attempt: {Message}", ex.Message);
                return Forbid();
            }
        }

        /// <summary>
        /// Lấy danh sách các yêu cầu xác minh đang chờ xử lý (Pending) cho CVA.
        /// Hỗ trợ phân trang.
        /// </summary>
        /// <param name="query">Thông tin phân trang (PageNumber, PageSize).</param>
        /// <returns>Danh sách các yêu cầu đang chờ dạng tóm tắt.</returns>
        [HttpGet("pending")]
        [Authorize(Roles = "CVA")]
        // Sử dụng PagedResult từ Application.Common
        [ProducesResponseType(typeof(ApiResponse<PagedResult<VerificationRequestSummaryDto>>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetPendingRequests([FromQuery] GetVerificationRequestsForCVAQuery query)
        {
            _logger.LogInformation("Fetching pending verification requests for CVA. Page: {Page}, Size: {Size}", query.PageNumber, query.PageSize);
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<object>.FailureResponse("Invalid pagination parameters.",
                   ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList()));
            }
            // Handler sẽ trả về PagedResult từ Application.Common
            PagedResult<VerificationRequestSummaryDto> result = await Mediator.Send(query);
            // Trả về ApiResponse chứa PagedResult
            return Ok(ApiResponse<PagedResult<VerificationRequestSummaryDto>>.SuccessResponse(result, $"Found {result.TotalCount} pending requests."));
        }

        /// <summary>
        /// Lấy chi tiết một yêu cầu xác minh theo ID.
        /// </summary>
        /// <param name="id">ID của VerificationRequest.</param>
        /// <returns>Thông tin chi tiết của yêu cầu.</returns>
        [HttpGet("{id}")]
        [Authorize(Roles = "CVA, Admin")]
        [ProducesResponseType(typeof(ApiResponse<VerificationRequestDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetRequestById(Guid id)
        {
            _logger.LogInformation("Fetching details for verification request {VerificationRequestId}", id);
            var query = new GetVerificationRequestByIdQuery(id);
            var result = await Mediator.Send(query);

            if (result == null)
            {
                _logger.LogWarning("Verification request not found: {VerificationRequestId}", id);
                return NotFound(ApiResponse<object>.FailureResponse("Verification request not found."));
            }

            return Ok(ApiResponse<VerificationRequestDto>.SuccessResponse(result));
        }
    }
}