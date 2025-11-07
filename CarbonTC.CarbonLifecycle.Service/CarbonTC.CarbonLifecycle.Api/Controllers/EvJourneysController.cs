using CarbonTC.CarbonLifecycle.Application.Commands.EVJourney;
using CarbonTC.CarbonLifecycle.Application.Commands.JourneyBatch;
using CarbonTC.CarbonLifecycle.Application.Common;
using CarbonTC.CarbonLifecycle.Application.DTOs;
using CarbonTC.CarbonLifecycle.Application.Queries.EVJourney;
using CarbonTC.CarbonLifecycle.Application.Services;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System.IO;
using Microsoft.Extensions.Options;
using CarbonTC.CarbonLifecycle.Infrastructure.Configuration;
using Microsoft.AspNetCore.Authorization;
using System.Collections.Generic;


namespace CarbonTC.CarbonLifecycle.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "EVOwner")] 
    public class EvJourneysController : BaseApiController
    {
        private readonly ILogger<EvJourneysController> _logger;
        private readonly IIdentityService _identityService;
        private readonly FileStorageSettings _fileStorageSettings;

        public EvJourneysController(ILogger<EvJourneysController> logger, IIdentityService identityService, IOptions<FileStorageSettings> fileStorageOptions)
        {
            _logger = logger;
            _identityService = identityService;
            _fileStorageSettings = fileStorageOptions.Value;
        }

        /// Tải lên một hành trình EV (EV Journey)
        /// ...
        [HttpPost("upload")]
        [ProducesResponseType(typeof(ApiResponse<EvJourneyResponseDto>), 200)]
        [ProducesResponseType(typeof(ApiResponse<object>), 400)]
        [ProducesResponseType(typeof(ApiResponse<object>), 401)]
        [ProducesResponseType(typeof(ApiResponse<object>), 404)]
        [ProducesResponseType(typeof(ApiResponse<object>), 500)]
        public async Task<IActionResult> UploadJourney([FromBody] EvJourneyUploadDto uploadDto)
        {
            _logger.LogInformation("Attempting to upload new EV journey");
            try
            {
                var command = new UploadEVJourneyCommand(uploadDto);
                var result = await Mediator.Send(command);

                return Ok(ApiResponse<EvJourneyResponseDto>.SuccessResponse(result, "Journey uploaded successfully"));
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized attempt to upload journey");
                return Unauthorized(ApiResponse<object>.FailureResponse(ex.Message));
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Resource not found during journey upload: {Message}", ex.Message);
                return NotFound(ApiResponse<object>.FailureResponse(ex.Message));
            }
        }

        /// <summary>
        /// Lấy danh sách hành trình của người dùng đang đăng nhập.
        /// </summary>
        /// <returns>Danh sách hành trình của tôi.</returns>
        [HttpGet("my-journeys")] // Đổi route thành "my-journeys"
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<EvJourneyResponseDto>>), 200)]
        [ProducesResponseType(typeof(ApiResponse<object>), 401)]
        [ProducesResponseType(typeof(ApiResponse<object>), 500)]
        public async Task<IActionResult> GetMyJourneys() // Xóa tham số string ownerId
        {
            // Lấy ownerId từ token, không phải từ URL
            var ownerId = _identityService.GetUserId();
            if (string.IsNullOrEmpty(ownerId))
            {
                return Unauthorized(ApiResponse<object>.FailureResponse("User not authenticated.", ""));
            }

            _logger.LogInformation("Getting journeys for current user: {OwnerId}", ownerId);
            var query = new GetEVJourneysByOwnerIdQuery(ownerId); // Sử dụng ownerId từ token
            var result = await Mediator.Send(query);

            return Ok(ApiResponse<IEnumerable<EvJourneyResponseDto>>.SuccessResponse(result, $"Found {result.Count()} journeys"));
        }

        /// <summary>
        /// Lấy danh sách phương tiện với thống kê tổng hợp của người dùng đang đăng nhập.
        /// </summary>
        /// <returns>Danh sách phương tiện với thống kê.</returns>
        [HttpGet("my-vehicles")]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<VehicleSummaryDto>>), 200)]
        [ProducesResponseType(typeof(ApiResponse<object>), 401)]
        [ProducesResponseType(typeof(ApiResponse<object>), 500)]
        public async Task<IActionResult> GetMyVehicles()
        {
            var ownerId = _identityService.GetUserId();
            if (string.IsNullOrEmpty(ownerId))
            {
                return Unauthorized(ApiResponse<object>.FailureResponse("User not authenticated.", ""));
            }

            _logger.LogInformation("Getting vehicles for current user: {OwnerId}", ownerId);
            var query = new GetMyVehiclesQuery(ownerId);
            var result = await Mediator.Send(query);

            return Ok(ApiResponse<IEnumerable<VehicleSummaryDto>>.SuccessResponse(result, $"Found {result.Count()} vehicles"));
        }


        /// Lấy chi tiết một hành trình
        /// ...
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
        [HttpPost("batch")]
        [ProducesResponseType(typeof(ApiResponse<JourneyBatchDto>), 200)]
        [ProducesResponseType(typeof(ApiResponse<object>), 400)]
        [ProducesResponseType(typeof(ApiResponse<object>), 401)]
        [ProducesResponseType(typeof(ApiResponse<object>), 404)]
        [ProducesResponseType(typeof(ApiResponse<object>), 500)]
        public async Task<IActionResult> CreateBatch([FromBody] JourneyBatchCreateDto batchDto)
        {
            _logger.LogInformation("Attempting to create a new journey batch with {Count} journeys", batchDto.JourneyIds.Count);
            try
            {
                var command = new CreateJourneyBatchCommand(batchDto);
                var result = await Mediator.Send(command);

                return Ok(ApiResponse<JourneyBatchDto>.SuccessResponse(result, "Journey batch created successfully"));
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized attempt to create batch");
                return Unauthorized(ApiResponse<object>.FailureResponse(ex.Message));
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Resource not found during batch creation: {Message}", ex.Message);
                return NotFound(ApiResponse<object>.FailureResponse(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid operation during batch creation: {Message}", ex.Message);
                return BadRequest(ApiResponse<object>.FailureResponse(ex.Message));
            }
        }

        /// Tải lên tệp (CSV hoặc JSON) chứa nhiều hành trình EV.
        [HttpPost("upload-file")]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(typeof(ApiResponse<FileUploadResultDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> UploadJourneyFile(IFormFile file)
        {
            _logger.LogInformation("Attempting to upload journey file: {FileName}", file?.FileName);

            if (file == null || file.Length == 0)
            {
                return BadRequest(ApiResponse<object>.FailureResponse("No file uploaded or file is empty.", ""));
            }
            if (file.Length > _fileStorageSettings.MaxFileSizeBytes)
            {
                return BadRequest(ApiResponse<object>.FailureResponse($"File size exceeds the limit of {_fileStorageSettings.MaxFileSizeBytes / 1024 / 1024} MB.", ""));
            }
            var fileExtension = Path.GetExtension(file.FileName)?.ToLowerInvariant();
            var allowedExtensions = new[] { ".csv", ".json" };
            if (string.IsNullOrEmpty(fileExtension) || !allowedExtensions.Contains(fileExtension))
            {
                return BadRequest(ApiResponse<object>.FailureResponse($"Invalid file type. Only {string.Join(", ", allowedExtensions)} files are allowed.", ""));
            }

            // --- Get User ID ---
            var ownerId = _identityService.GetUserId(); 
            if (string.IsNullOrEmpty(ownerId))
            {
                return Unauthorized(ApiResponse<object>.FailureResponse("User not authenticated.", ""));
            }

            try
            {
                await using var stream = file.OpenReadStream();
                var command = new ProcessJourneyFileCommand(stream, file.FileName, file.ContentType, ownerId);
                var result = await Mediator.Send(command);

                if (result.FailedRecords > 0)
                {
                    return Ok(ApiResponse<FileUploadResultDto>.SuccessResponse(result, $"File processed with {result.FailedRecords} errors."));
                }

                return Ok(ApiResponse<FileUploadResultDto>.SuccessResponse(result, "Journey file processed successfully."));
            }
            catch (ArgumentException argEx)
            {
                _logger.LogWarning(argEx, "Bad request during file upload processing: {FileName}", file.FileName);
                return BadRequest(ApiResponse<object>.FailureResponse("Failed to process file due to invalid data or format.", argEx.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing uploaded journey file: {FileName}", file.FileName);
                return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<object>.FailureResponse("An internal error occurred while processing the file.", ex.Message));
            }
        }
    }
}