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

namespace CarbonTC.CarbonLifecycle.Api.Controllers
{
    // Kế thừa từ BaseApiController
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

        /// <summary>
        /// Tải lên tệp (CSV hoặc JSON) chứa nhiều hành trình EV.
        /// </summary>
        /// <param name="file">Tệp tin hành trình.</param>
        /// <returns>Kết quả xử lý tệp.</returns>
        [HttpPost("upload-file")]
        [Consumes("multipart/form-data")] // Specify content type
        [ProducesResponseType(typeof(ApiResponse<FileUploadResultDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> UploadJourneyFile(IFormFile file)
        {
            _logger.LogInformation("Attempting to upload journey file: {FileName}", file?.FileName);

            // --- Basic Input Validation ---
            if (file == null || file.Length == 0)
            {
                return BadRequest(ApiResponse<object>.FailureResponse("No file uploaded or file is empty.", ""));
            }

            if (file.Length > _fileStorageSettings.MaxFileSizeBytes)
            {
                return BadRequest(ApiResponse<object>.FailureResponse($"File size exceeds the limit of {_fileStorageSettings.MaxFileSizeBytes / 1024 / 1024} MB.", ""));
            }

            var fileExtension = Path.GetExtension(file.FileName)?.ToLowerInvariant();
            var allowedExtensions = new[] { ".csv", ".json" }; // Define allowed extensions here
            if (string.IsNullOrEmpty(fileExtension) || !allowedExtensions.Contains(fileExtension))
            {
                return BadRequest(ApiResponse<object>.FailureResponse($"Invalid file type. Only {string.Join(", ", allowedExtensions)} files are allowed.", ""));
            }
            // You might also want to check file.ContentType if needed, e.g., "text/csv", "application/json"

            // --- Get User ID ---
            var ownerId = _identityService.GetUserId();
            if (string.IsNullOrEmpty(ownerId))
            {
                return Unauthorized(ApiResponse<object>.FailureResponse("User not authenticated.", ""));
            }

            try
            {
                // --- Send Command ---
                // OpenReadStream provides a readable stream for the file content
                await using var stream = file.OpenReadStream();
                var command = new ProcessJourneyFileCommand(stream, file.FileName, file.ContentType, ownerId);
                var result = await Mediator.Send(command);

                if (result.FailedRecords > 0)
                {
                    // If there were partial failures, still return 200 OK but include errors
                    return Ok(ApiResponse<FileUploadResultDto>.SuccessResponse(result, $"File processed with {result.FailedRecords} errors."));
                }

                return Ok(ApiResponse<FileUploadResultDto>.SuccessResponse(result, "Journey file processed successfully."));
            }
            catch (ArgumentException argEx) // Catch specific validation/parsing exceptions if thrown by handler
            {
                _logger.LogWarning(argEx, "Bad request during file upload processing: {FileName}", file.FileName);
                return BadRequest(ApiResponse<object>.FailureResponse("Failed to process file due to invalid data or format.", argEx.Message));
            }
            catch (Exception ex) // Catch unexpected errors
            {
                _logger.LogError(ex, "Error processing uploaded journey file: {FileName}", file.FileName);
                return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<object>.FailureResponse("An internal error occurred while processing the file.", ex.Message));
            }
        }
    }
}