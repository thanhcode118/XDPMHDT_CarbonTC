using CarbonTC.CarbonLifecycle.Application.Commands.AuditReport;
using CarbonTC.CarbonLifecycle.Application.Common;
using CarbonTC.CarbonLifecycle.Application.DTOs;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;

namespace CarbonTC.CarbonLifecycle.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Yêu cầu đăng nhập chung
    public class AuditReportsController : BaseApiController // Kế thừa BaseApiController để có Mediator
    {
        private readonly ILogger<AuditReportsController> _logger;

        public AuditReportsController(ILogger<AuditReportsController> logger) : base()
        {
            _logger = logger;
        }

        /// <summary>
        /// Tạo một báo cáo audit (Audit Report) mới.
        /// Endpoint này dành cho CVA hoặc hệ thống nội bộ để ghi lại các thay đổi.
        /// </summary>
        /// <param name="createDto">DTO chứa thông tin để tạo audit report.</param>
        /// <returns>ID của audit report vừa được tạo.</returns>
        [HttpPost]
        [Authorize(Roles = "CVA, Admin")] // Chỉ CVA hoặc Admin mới được phép tạo Audit Report trực tiếp
        [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> CreateAuditReport([FromBody] AuditReportCreateDto createDto)
        {
            _logger.LogInformation("Attempting to create new audit report for EntityType: {EntityType}, EntityId: {EntityId}",
                createDto.EntityType, createDto.EntityId);

            var command = new CreateAuditReportCommand(createDto); //

            try
            {
                // Handler sẽ trả về Guid của report mới
                var reportId = await Mediator.Send(command);

                if (reportId == Guid.Empty)
                {
                    // Xử lý trường hợp Handler (tạm thời) chưa implement
                    _logger.LogWarning("AuditReport creation did not return a valid ID (handler might not be fully implemented).");
                    // Trả về 200 OK nhưng với thông báo
                    return Ok(ApiResponse<Guid>.SuccessResponse(reportId, "Audit report command processed, but handler returned empty ID."));
                }

                // Trả về 201 Created
                // Giả sử không có endpoint GetById cho AuditReport, nên chỉ trả về 201 với data
                return StatusCode(StatusCodes.Status201Created, ApiResponse<Guid>.SuccessResponse(reportId, "Audit report created successfully."));
            }
            catch (ArgumentException ex) // Bắt lỗi validation (ví dụ)
            {
                _logger.LogWarning(ex, "Invalid data for creating audit report: {Message}", ex.Message);
                return BadRequest(ApiResponse<object>.FailureResponse("Invalid data provided.", ex.Message));
            }
            // Các lỗi 500 khác sẽ được ErrorHandlingMiddleware xử lý
        }

        // Lưu ý: Thường thì CVA sẽ không GET AuditReports trực tiếp,
        // mà chúng sẽ được xem như một phần của VerificationRequest chi tiết.
        // Nếu cần endpoint GET, chúng ta có thể thêm sau.
    }
}