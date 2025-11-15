using System;
using System.Threading.Tasks;
using CarbonTC.CarbonLifecycle.Application.Common;
using CarbonTC.CarbonLifecycle.Application.DTOs;
using CarbonTC.CarbonLifecycle.Application.Queries.CVAStandard; 
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Linq;
using CarbonTC.CarbonLifecycle.Application.Queries.CarbonCredit;
using CarbonTC.CarbonLifecycle.Application.Commands.CarbonCredit;
using Microsoft.AspNetCore.Http;

namespace CarbonTC.CarbonLifecycle.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Yêu cầu đăng nhập
    public class CarbonCreditsController : BaseApiController
    {
        private readonly ILogger<CarbonCreditsController> _logger;

        public CarbonCreditsController(ILogger<CarbonCreditsController> logger)
        {
            _logger = logger;
        }

        /// Lấy Tiêu chuẩn CVA được áp dụng cho một Tín chỉ Carbon (Credit)
        /// Truy vấn theo chuỗi: Credit -> VerificationRequest -> CVAStandard
        [HttpGet("{creditId}/standard")]
        [ProducesResponseType(typeof(ApiResponse<CvaStandardDto>), 200)]
        [ProducesResponseType(typeof(ApiResponse<object>), 404)]
        [ProducesResponseType(typeof(ApiResponse<object>), 500)]
        public async Task<IActionResult> GetStandardByCreditId(Guid creditId)
        {
            _logger.LogInformation("Getting CVA Standard for CreditId: {CreditId}", creditId);

            var query = new GetCvaStandardByCreditIdQuery(creditId);
            var result = await Mediator.Send(query);

            if (result == null)
            {
                _logger.LogWarning("No standard found for CreditId: {CreditId}", creditId);
                return NotFound(ApiResponse<object>.FailureResponse("No CVA standard found associated with this credit ID.", ""));
            }

            return Ok(ApiResponse<CvaStandardDto>.SuccessResponse(result, "CVA standard retrieved successfully."));
        }

        /// <summary>
        /// Lấy danh sách tất cả Carbon Credit (Tín chỉ Carbon) theo UserId
        /// </summary>
        /// <param name="userId">ID của người dùng</param>
        /// <returns>Danh sách Carbon Credits</returns>
        [HttpGet("user/{userId}")]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<CarbonCreditDto>>), 200)]
        [ProducesResponseType(typeof(ApiResponse<object>), 404)]
        [ProducesResponseType(typeof(ApiResponse<object>), 500)]
        public async Task<IActionResult> GetCarbonCreditsByUserId(string userId)
        {
            _logger.LogInformation("Getting Carbon Credits for UserId: {UserId}", userId);

            var query = new GetCarbonCreditsByUserIdQuery(userId);
            var result = await Mediator.Send(query);

            // Kiểm tra nếu kết quả là null hoặc rỗng (không dùng !result.Any() để tránh lỗi nếu result là null)
            if (result == null || !result.Any())
            {
                _logger.LogWarning("No Carbon Credits found for UserId: {UserId}", userId);
                // Trả về một danh sách rỗng thay vì 404, hoặc 404 tùy theo logic nghiệp vụ của bạn
                // Ở đây tôi trả về 200 với danh sách rỗng theo chuẩn chung
                return Ok(ApiResponse<IEnumerable<CarbonCreditDto>>.SuccessResponse(new List<CarbonCreditDto>(), "No Carbon Credits found for this User ID."));
            }

            return Ok(ApiResponse<IEnumerable<CarbonCreditDto>>.SuccessResponse(result, "Carbon Credits retrieved successfully."));
        }

        /// <summary>
        /// Phát hành tín chỉ carbon thủ công (bypass/sửa lỗi)
        /// - CVA: Có thể phát hành thủ công để xử lý ngoại lệ
        /// - Admin: Có thể phát hành trực tiếp cho bất kỳ user nào (bypass verification)
        /// - EVOwner: KHÔNG được phép gọi endpoint này (chỉ được phát hành qua luồng tự động khi CVA duyệt)
        /// </summary>
        /// <param name="issueDto">Thông tin để phát hành tín chỉ carbon</param>
        /// <returns>Tín chỉ carbon đã được phát hành</returns>
        [HttpPost("issue")]
        [Authorize(Roles = "CVA,Admin")] // Chỉ CVA và Admin có thể phát hành thủ công (bypass/sửa lỗi)
        [ProducesResponseType(typeof(ApiResponse<CarbonCreditDto>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> IssueCarbonCredit([FromBody] IssueCarbonCreditDto issueDto)
        {
            _logger.LogInformation("Attempting to issue carbon credit. Amount: {Amount} kg CO2e, UserId: {UserId}, JourneyBatchId: {JourneyBatchId}",
                issueDto.AmountKgCO2e, issueDto.UserId ?? "will be taken from token", issueDto.JourneyBatchId);

            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<object>.FailureResponse("Invalid request data.", 
                    ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList()));
            }

            var command = new IssueCarbonCreditCommand(issueDto);

            try
            {
                var result = await Mediator.Send(command);
                return CreatedAtAction(
                    nameof(GetCarbonCreditsByUserId),
                    new { userId = result.UserId },
                    ApiResponse<CarbonCreditDto>.SuccessResponse(result, "Carbon credit issued successfully."));
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid data provided for carbon credit issuance: {Message}", ex.Message);
                return BadRequest(ApiResponse<object>.FailureResponse(ex.Message));
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Resource not found during carbon credit issuance: {Message}", ex.Message);
                return NotFound(ApiResponse<object>.FailureResponse(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid operation during carbon credit issuance: {Message}", ex.Message);
                return BadRequest(ApiResponse<object>.FailureResponse(ex.Message));
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized access during carbon credit issuance: {Message}", ex.Message);
                return StatusCode(StatusCodes.Status403Forbidden, ApiResponse<object>.FailureResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during carbon credit issuance");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<object>.FailureResponse("An error occurred while issuing carbon credit."));
            }
        }
    }
}