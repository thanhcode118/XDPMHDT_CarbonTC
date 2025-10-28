using CarbonTC.CarbonLifecycle.Application.Common;
using CarbonTC.CarbonLifecycle.Application.DTOs;
using CarbonTC.CarbonLifecycle.Application.Queries.JourneyBatch; 
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
// Thêm [Authorize] nếu cần yêu cầu đăng nhập
// using Microsoft.AspNetCore.Authorization;

namespace CarbonTC.CarbonLifecycle.Api.Controllers
{
    // Kế thừa BaseApiController để có Mediator
    // [Authorize] // Bỏ comment nếu API này yêu cầu đăng nhập
    public class JourneyBatchesController : BaseApiController
    {
        private readonly ILogger<JourneyBatchesController> _logger;

        public JourneyBatchesController(ILogger<JourneyBatchesController> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// Lấy danh sách các lô hành trình của người dùng đang đăng nhập.
        /// </summary>
        [HttpGet("mybatches")] // Route cho endpoint mới
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<JourneyBatchDto>>), 200)]
        [ProducesResponseType(typeof(ApiResponse<object>), 401)] // Unauthorized
        [ProducesResponseType(typeof(ApiResponse<object>), 500)]
        public async Task<IActionResult> GetMyBatches()
        {
            _logger.LogInformation("Attempting to get journey batches for the current user.");

            var query = new GetMyJourneyBatchesQuery(); // Tạo query mới
            try
            {
                var result = await Mediator.Send(query);
                return Ok(ApiResponse<IEnumerable<JourneyBatchDto>>.SuccessResponse(result, $"Found {result.Count()} batches."));
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized attempt to get batches.");
                return Unauthorized(ApiResponse<object>.FailureResponse("User not authenticated.", ex.Message));
            }
            // Các lỗi khác sẽ được ErrorHandlingMiddleware xử lý trả về 500
        }

        // --- Có thể thêm các endpoint khác cho Batch tại đây ---
        // Ví dụ: GetBatchById, DeleteBatch, UpdateBatchStatus,...
    }
}