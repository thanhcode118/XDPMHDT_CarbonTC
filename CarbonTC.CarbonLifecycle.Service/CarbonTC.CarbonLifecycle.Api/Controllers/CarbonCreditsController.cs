using System;
using System.Threading.Tasks;
using CarbonTC.CarbonLifecycle.Application.Common;
using CarbonTC.CarbonLifecycle.Application.DTOs;
using CarbonTC.CarbonLifecycle.Application.Queries.CVAStandard; 
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using CarbonTC.CarbonLifecycle.Application.Queries.CarbonCredit;

namespace CarbonTC.CarbonLifecycle.Api.Controllers
{
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
    }
}