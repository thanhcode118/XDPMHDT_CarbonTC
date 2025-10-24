using System;
using System.Threading.Tasks;
using CarbonTC.CarbonLifecycle.Application.Common;
using CarbonTC.CarbonLifecycle.Application.DTOs;
using CarbonTC.CarbonLifecycle.Application.Queries.CVAStandard; 
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

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
    }
}