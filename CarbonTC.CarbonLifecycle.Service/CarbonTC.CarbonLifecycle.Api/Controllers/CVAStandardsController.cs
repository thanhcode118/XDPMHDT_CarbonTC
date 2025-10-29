// File: CarbonTC.CarbonLifecycle.Api/Controllers/CVAStandardsController.cs
using CarbonTC.CarbonLifecycle.Application.Commands.CVAStandard; // Add/Update Commands
using CarbonTC.CarbonLifecycle.Application.Queries.CVAStandard; // Get Query
using CarbonTC.CarbonLifecycle.Application.Common;
using CarbonTC.CarbonLifecycle.Application.DTOs;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CarbonTC.CarbonLifecycle.Api.Controllers
{
    [Route("api/cva-standards")] // Đổi route cho rõ ràng
    [ApiController]
    [Authorize] // Yêu cầu đăng nhập, có thể cần cụ thể hơn (Admin?)
    public class CVAStandardsController : BaseApiController
    {
        private readonly ILogger<CVAStandardsController> _logger;

        public CVAStandardsController(ILogger<CVAStandardsController> logger) : base()
        {
            _logger = logger;
        }

        // --- Endpoint MỚI: Get All Standards (with filter) ---
        [HttpGet]
        [AllowAnonymous] // Cho phép xem public? Hoặc [Authorize(Roles = "Admin, CVA, EVOwner")]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<CvaStandardDto>>), 200)]
        [ProducesResponseType(typeof(ApiResponse<object>), 500)]
        public async Task<IActionResult> GetAllStandards([FromQuery] bool? isActive)
        {
            _logger.LogInformation("Fetching CVA standards with IsActive filter: {IsActive}", isActive?.ToString() ?? "All");
            var query = new GetCVAStandardsQuery { IsActive = isActive };
            var result = await Mediator.Send(query);
            return Ok(ApiResponse<IEnumerable<CvaStandardDto>>.SuccessResponse(result, $"Found {result.Count()} standards."));
        }

        // --- Endpoint MỚI: Add New Standard ---
        [HttpPost]
        [Authorize(Roles = "Admin")] // Chỉ Admin được thêm?
        [ProducesResponseType(typeof(ApiResponse<CvaStandardDto>), 201)] // Created
        [ProducesResponseType(typeof(ApiResponse<object>), 400)]
        [ProducesResponseType(typeof(ApiResponse<object>), 401)]
        [ProducesResponseType(typeof(ApiResponse<object>), 500)]
        public async Task<IActionResult> AddStandard([FromBody] CVAStandardCreateDto createDto)
        {
            _logger.LogInformation("Attempting to add new CVA standard: {StandardName}", createDto.StandardName);
            var command = new AddCVAStandardCommand(createDto);
            try
            {
                var result = await Mediator.Send(command);
                // Trả về 201 Created với header Location trỏ đến resource mới (nếu có endpoint GetById)
                return CreatedAtAction(nameof(GetStandardById), new { id = result.Id }, ApiResponse<CvaStandardDto>.SuccessResponse(result, "CVA standard created successfully."));
                // Hoặc đơn giản là Ok nếu không có GetById
                // return Ok(ApiResponse<CvaStandardDto>.SuccessResponse(result, "CVA standard created successfully."));
            }
            catch (InvalidOperationException ex) // Ví dụ: Bắt lỗi trùng lặp nếu có kiểm tra
            {
                _logger.LogWarning(ex, "Failed to add standard: {Message}", ex.Message);
                return BadRequest(ApiResponse<object>.FailureResponse(ex.Message));
            }
            // Lỗi validation (ArgumentException) hoặc lỗi khác sẽ được middleware xử lý
        }

        // --- Endpoint MỚI: Update Standard ---
        [HttpPut("{id}")] // Dùng ID trên route
        [Authorize(Roles = "Admin")] // Chỉ Admin được sửa?
        [ProducesResponseType(typeof(ApiResponse<CvaStandardDto>), 200)]
        [ProducesResponseType(typeof(ApiResponse<object>), 400)]
        [ProducesResponseType(typeof(ApiResponse<object>), 401)]
        [ProducesResponseType(typeof(ApiResponse<object>), 404)]
        [ProducesResponseType(typeof(ApiResponse<object>), 500)]
        public async Task<IActionResult> UpdateStandard(Guid id, [FromBody] CVAStandardUpdateDto updateDto)
        {
            _logger.LogInformation("Attempting to update CVA standard {StandardId}", id);
            var command = new UpdateCVAStandardCommand(id, updateDto);
            try
            {
                var result = await Mediator.Send(command);
                return Ok(ApiResponse<CvaStandardDto>.SuccessResponse(result, "CVA standard updated successfully."));
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Failed to update standard: {Message}", ex.Message);
                return NotFound(ApiResponse<object>.FailureResponse(ex.Message));
            }
            catch (InvalidOperationException ex) // Ví dụ: lỗi nghiệp vụ khác
            {
                _logger.LogWarning(ex, "Failed to update standard: {Message}", ex.Message);
                return BadRequest(ApiResponse<object>.FailureResponse(ex.Message));
            }
            // Lỗi validation hoặc lỗi khác sẽ được middleware xử lý
        }

        // --- Endpoint MỚI: Get Standard By ID (Cần thiết cho CreatedAtAction) ---
        [HttpGet("{id}")]
        [AllowAnonymous] // Hoặc phân quyền tương tự GetAll
        [ProducesResponseType(typeof(ApiResponse<CvaStandardDto>), 200)]
        [ProducesResponseType(typeof(ApiResponse<object>), 404)]
        [ProducesResponseType(typeof(ApiResponse<object>), 500)]
        public async Task<IActionResult> GetStandardById(Guid id)
        {
            // TODO: Tạo Query và Handler cho GetCVAStandardByIdQuery nếu chưa có
            _logger.LogInformation("Fetching CVA standard details for ID: {StandardId}", id);
            // Giả sử đã tạo GetCVAStandardByIdQuery
            // var query = new GetCVAStandardByIdQuery(id);
            // var result = await Mediator.Send(query);
            // if (result == null) return NotFound(...);
            // return Ok(ApiResponse<CvaStandardDto>.SuccessResponse(result));

            // Tạm thời trả về NotFound
            await Task.CompletedTask; // Giả lập async
            _logger.LogWarning("GetCVAStandardById endpoint not fully implemented yet.");
            return NotFound(ApiResponse<object>.FailureResponse("Endpoint to get standard by ID not implemented."));
        }
    }
}