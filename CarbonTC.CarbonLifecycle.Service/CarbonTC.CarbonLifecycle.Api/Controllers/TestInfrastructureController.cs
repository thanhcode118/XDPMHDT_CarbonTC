using Microsoft.AspNetCore.Mvc;
using CarbonTC.CarbonLifecycle.Application.Abstractions.Messaging;
using CarbonTC.CarbonLifecycle.Application.Abstractions.Storage;
using CarbonTC.CarbonLifecycle.Application.Common;
using CarbonTC.CarbonLifecycle.Domain.Events;
using CarbonTC.CarbonLifecycle.Domain.Repositories;
using CarbonTC.CarbonLifecycle.Infrastructure.Persistence;
using System.Text;

namespace CarbonTC.CarbonLifecycle.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestInfrastructureController : ControllerBase
    {
        private readonly IEVJourneyRepository _journeyRepository;
        private readonly IJourneyBatchRepository _batchRepository;
        private readonly IMessagePublisher _messagePublisher;
        private readonly IFileStorageService _fileStorage;
        private readonly ILogger<TestInfrastructureController> _logger;
        private readonly AppDbContext _context;

        public TestInfrastructureController(
            IEVJourneyRepository journeyRepository,
            IJourneyBatchRepository batchRepository,
            IMessagePublisher messagePublisher,
            IFileStorageService fileStorage,
            ILogger<TestInfrastructureController> logger,
            AppDbContext context)
        {
            _journeyRepository = journeyRepository;
            _batchRepository = batchRepository;
            _messagePublisher = messagePublisher;
            _fileStorage = fileStorage;
            _logger = logger;
            _context = context;
        }

        /// <summary>
        /// Test RabbitMQ message publishing
        /// </summary>
        [HttpPost("test-rabbitmq")]
        public async Task<IActionResult> TestRabbitMQ()
        {
            try
            {
                var testEvent = new JourneyBatchSubmittedForVerificationEvent(
                    Guid.NewGuid(),
                    "test-user-123"
                );

                await _messagePublisher.PublishAsync(testEvent);

                return Ok(ApiResponse<object>.SuccessResponse(
                    new { EventId = testEvent.JourneyBatchId, EventType = testEvent.GetType().Name },
                    "RabbitMQ test event published successfully"
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "RabbitMQ test failed");
                return StatusCode(500, ApiResponse<object>.FailureResponse(
                    "RabbitMQ test failed",
                    ex.Message
                ));
            }
        }

        /// <summary>
        /// Test file storage
        /// </summary>
        [HttpPost("test-file-storage")]
        public async Task<IActionResult> TestFileStorage()
        {
            try
            {
                var testContent = "Test file content for Carbon Lifecycle Service";
                var contentBytes = Encoding.UTF8.GetBytes(testContent);
                using var stream = new MemoryStream(contentBytes);

                var filePath = await _fileStorage.SaveFileAsync(
                    "test-file.json",
                    stream,
                    "test-user-123",
                    "application/json"
                );

                var fileExists = await _fileStorage.FileExistsAsync(filePath);
                var metadata = await _fileStorage.GetFileMetadataAsync(filePath);

                return Ok(ApiResponse<object>.SuccessResponse(
                    new
                    {
                        FilePath = filePath,
                        FileExists = fileExists,
                        Metadata = metadata
                    },
                    "File storage test completed successfully"
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "File storage test failed");
                return StatusCode(500, ApiResponse<object>.FailureResponse(
                    "File storage test failed",
                    ex.Message
                ));
            }
        }

        /// <summary>
        /// Test database connectivity and repositories
        /// </summary>
        [HttpGet("test-database")]
        public async Task<IActionResult> TestDatabase()
        {
            try
            {
                var batches = await _batchRepository.GetByUserIdAsync("test-user");
                var journeys = await _journeyRepository.GetByOwnerIdAsync("test-user");

                return Ok(ApiResponse<object>.SuccessResponse(
                    new
                    {
                        BatchCount = batches?.Count() ?? 0,
                        JourneyCount = journeys?.Count() ?? 0,
                        DatabaseConnected = true
                    },
                    "Database test completed successfully"
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Database test failed");
                return StatusCode(500, ApiResponse<object>.FailureResponse(
                    "Database test failed",
                    ex.Message
                ));
            }
        }

        /// <summary>
        /// Health check endpoint
        /// </summary>
        [HttpGet("health")]
        public IActionResult HealthCheck()
        {
            return Ok(ApiResponse<object>.SuccessResponse(
                new
                {
                    Status = "Healthy",
                    Timestamp = DateTime.UtcNow,
                    Environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")
                },
                "Service is running"
            ));
        }

        /// <summary>
        /// Thêm dữ liệu seed vào database (10 hàng mỗi bảng)
        /// CHỈ DÙNG TRONG MÔI TRƯỜNG DEVELOPMENT!
        /// </summary>
        [HttpPost("seed-more-data")]
        public async Task<IActionResult> SeedMoreData()
        {
            try
            {
                await DbInitializer.AddMoreSeedData(_context);
                
                return Ok(ApiResponse<object>.SuccessResponse(
                    new
                    {
                        Message = "Đã thêm thành công 10 hàng dữ liệu vào mỗi bảng",
                        Timestamp = DateTime.UtcNow
                    },
                    "Seed data added successfully"
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to seed more data");
                return StatusCode(500, ApiResponse<object>.FailureResponse(
                    "Failed to seed data",
                    ex.Message
                ));
            }
        }
    }
}