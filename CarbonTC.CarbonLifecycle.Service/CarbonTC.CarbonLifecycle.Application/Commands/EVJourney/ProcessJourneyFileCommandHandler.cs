using MediatR;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using CarbonTC.CarbonLifecycle.Application.Abstractions.Storage; 
using CarbonTC.CarbonLifecycle.Application.DTOs;
using CarbonTC.CarbonLifecycle.Domain.Entities;
using CarbonTC.CarbonLifecycle.Domain.Enums;
using CarbonTC.CarbonLifecycle.Domain.Repositories;
using CsvHelper;
using CsvHelper.Configuration;
using Microsoft.Extensions.Logging;

namespace CarbonTC.CarbonLifecycle.Application.Commands.EVJourney
{
    public class ProcessJourneyFileCommandHandler : IRequestHandler<ProcessJourneyFileCommand, FileUploadResultDto>
    {
        private readonly IEVJourneyRepository _journeyRepository;
        private readonly ICVAStandardRepository _standardRepository;
        private readonly IJourneyBatchRepository _batchRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ILogger<ProcessJourneyFileCommandHandler> _logger;
        private readonly IFileStorageService _fileStorageService;

        public ProcessJourneyFileCommandHandler(
            IEVJourneyRepository journeyRepository,
            ICVAStandardRepository standardRepository,
            IJourneyBatchRepository batchRepository,
            IUnitOfWork unitOfWork,
            IMapper mapper,
            ILogger<ProcessJourneyFileCommandHandler> logger,
            IFileStorageService fileStorageService)
        {
            _journeyRepository = journeyRepository;
            _standardRepository = standardRepository;
            _batchRepository = batchRepository;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _logger = logger;
            _fileStorageService = fileStorageService;
        }

        public async Task<FileUploadResultDto> Handle(ProcessJourneyFileCommand request, CancellationToken cancellationToken)
        {
            var result = new FileUploadResultDto();
            var validJourneysToSave = new List<CarbonTC.CarbonLifecycle.Domain.Entities.EVJourney>();
            var parsedRecords = new List<EvJourneyUploadDto>();
            string? storedFilePath = null; // Optional

            //Optional: Save the original file first
             try
            {
                request.FileStream.Position = 0; // Reset stream position before saving
                storedFilePath = await _fileStorageService.SaveFileAsync(request.FileName, request.FileStream, request.UserId, request.ContentType);
                result.StoredFilePath = storedFilePath;
                request.FileStream.Position = 0; // Reset stream position again before parsing
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to save uploaded file {FileName} for user {UserId}", request.FileName, request.UserId);
                // Decide if this failure should stop the whole process or just be logged
                result.Errors.Add($"Error saving original file: {ex.Message}");
                // Optionally return result here if saving is critical
            }


            // --- 1. Parse File ---
            try
            {
                var fileExtension = Path.GetExtension(request.FileName)?.ToLowerInvariant();

                if (fileExtension == ".csv")
                {
                    parsedRecords = ParseCsv(request.FileStream);
                }
                else if (fileExtension == ".json")
                {
                    parsedRecords = await ParseJsonAsync(request.FileStream);
                }
                else
                {
                    // This should have been caught by the controller, but double-check
                    throw new ArgumentException($"Unsupported file extension: {fileExtension}");
                }
                result.TotalRecords = parsedRecords.Count;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to parse journey file {FileName}", request.FileName);
                result.Errors.Add($"Error parsing file: {ex.Message}");
                // In case of parsing failure, we cannot continue, return immediately
                // Note: Consider returning BadRequestException or similar custom exception
                // for the controller to catch and return 400.
                // For simplicity here, we return the result DTO with errors. The controller
                // might need adjustment to handle this specific case as a 400 Bad Request.
                // Throwing ArgumentException which the controller catches is a good approach.
                throw new ArgumentException($"Error parsing file '{request.FileName}': {ex.Message}", ex);
            }

            if (!parsedRecords.Any())
            {
                result.Errors.Add("No valid journey records found in the file.");
                return result; // Return early if no records
            }

            // --- 2. Validate, Calculate CO2, and Create Entities ---
            CarbonTC.CarbonLifecycle.Domain.Entities.JourneyBatch? batchToUse = null; // Initialize batch variable

            for (int i = 0; i < parsedRecords.Count; i++)
            {
                var record = parsedRecords[i];
                var lineNumber = i + 1; // For user-friendly error messages (adjust if CSV has header)

                // Basic Validation
                List<string> recordErrors = ValidateRecord(record, lineNumber);
                if (recordErrors.Any())
                {
                    result.Errors.AddRange(recordErrors);
                    continue; // Skip to next record
                }

                // Get CVA Standard
                var standard = await _standardRepository.GetActiveStandardByVehicleTypeAsync(record.VehicleModel);
                if (standard == null)
                {
                    result.Errors.Add($"Line {lineNumber}: No active CVA standard found for vehicle type '{record.VehicleModel}'.");
                    continue;
                }

                // Calculate CO2
                decimal co2Saved = record.DistanceKm * standard.ConversionRate;


                // --- Find or Create Batch (Logic similar to single upload) ---
                if (batchToUse == null) // Only look for/create batch on the first valid record
                {
                    batchToUse = await _batchRepository.GetPendingBatchByOwnerIdAsync(request.UserId);
                    if (batchToUse == null)
                    {
                        batchToUse = new CarbonTC.CarbonLifecycle.Domain.Entities.JourneyBatch
                        {
                            Id = Guid.NewGuid(),
                            UserId = request.UserId,
                            CreationTime = DateTime.UtcNow,
                            Status = JourneyBatchStatus.Pending,
                            TotalDistanceKm = 0, // Will accumulate below
                            TotalCO2SavedKg = 0, // Will accumulate below
                            NumberOfJourneys = 0, // Will accumulate below
                            EVJourneys = new List<CarbonTC.CarbonLifecycle.Domain.Entities.EVJourney>()
                        };
                        await _batchRepository.AddAsync(batchToUse); // Add new batch to context
                    }
                    else
                    {
                        // Mark existing batch for update (EF Core tracks changes)
                        // No explicit UpdateAsync call needed here if using the same context instance
                    }
                }

                // Create EVJourney Entity
                var journeyEntity = new CarbonTC.CarbonLifecycle.Domain.Entities.EVJourney
                {
                    Id = Guid.NewGuid(),
                    JourneyBatchId = batchToUse.Id, // Assign Batch ID
                    UserId = request.UserId,
                    StartTime = record.StartTime,
                    EndTime = record.EndTime,
                    DistanceKm = record.DistanceKm,
                    VehicleType = record.VehicleModel,
                    CO2EstimateKg = co2Saved,
                    Status = JourneyStatus.Pending,
                    Origin = record.Origin ?? "N/A", // Handle optional fields
                    Destination = record.Destination ?? "N/A"
                };

                // Accumulate batch totals
                batchToUse.TotalDistanceKm += journeyEntity.DistanceKm;
                batchToUse.TotalCO2SavedKg += journeyEntity.CO2EstimateKg;
                batchToUse.NumberOfJourneys += 1;
                batchToUse.LastModifiedAt = DateTime.UtcNow; // Update batch modification time

                validJourneysToSave.Add(journeyEntity);
            }

            result.SuccessfulRecords = validJourneysToSave.Count;

            // --- 3. Save to Database ---
            if (validJourneysToSave.Any())
            {
                try
                {
                    // Add all valid journeys to the context
                    foreach (var journey in validJourneysToSave)
                    {
                        await _journeyRepository.AddAsync(journey);
                    }

                    // If we modified an existing batch, EF Core tracks it. If we added a new one, it's already added.
                    // SaveChanges will handle both adding journeys and adding/updating the batch.
                    await _unitOfWork.SaveChangesAsync(cancellationToken);
                    _logger.LogInformation("Successfully saved {Count} journeys from file {FileName} for user {UserId}",
                        validJourneysToSave.Count, request.FileName, request.UserId);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to save journeys from file {FileName} to database for user {UserId}", request.FileName, request.UserId);
                    result.Errors.Add($"Database error occurred while saving journeys: {ex.Message}");
                    // Depending on requirements, you might want to adjust SuccessfulRecords count here
                    // or clear validJourneysToSave list if the transaction failed.
                    // For simplicity, we report the DB error but keep the count of initially valid records.
                    // Throwing here will result in a 500 error from the controller.
                    throw; // Re-throw to indicate a server error
                }
            }
            else
            {
                _logger.LogWarning("No valid journeys found to save from file {FileName} for user {UserId}", request.FileName, request.UserId);
            }

            return result;
        }

        // --- Helper Methods for Parsing ---

        private List<EvJourneyUploadDto> ParseCsv(Stream stream)
        {
            try
            {
                using var reader = new StreamReader(stream, Encoding.UTF8); // Ensure correct encoding
                                                                            // Basic configuration: Assumes header row, uses CultureInfo.InvariantCulture for decimals/dates
                var config = new CsvConfiguration(CultureInfo.InvariantCulture)
                {
                    HasHeaderRecord = true, // Assumes first line is header
                    MissingFieldFound = null, // Allows optional fields to be missing
                    HeaderValidated = null, // You might want stricter header validation
                    TrimOptions = TrimOptions.Trim, // Trim whitespace
                };
                using var csv = new CsvReader(reader, config);

                // Register mapping if column names differ from DTO properties or need custom conversion
                // csv.Context.RegisterClassMap<YourCustomCsvMap>();

                // Reads all records - potentially memory intensive for very large files.
                // Consider reading row-by-row for large files.
                var records = csv.GetRecords<EvJourneyUploadDto>().ToList();
                return records;
            }
            catch (HeaderValidationException ex)
            {
                _logger.LogError(ex, "CSV Header validation failed.");
                throw new ArgumentException($"CSV file header is invalid. Expected columns like 'DistanceKm', 'StartTime', etc. Details: {ex.Message}", ex);
            }
            catch (CsvHelperException ex) // Catch CsvHelper specific errors
            {
                _logger.LogError(ex, "Error parsing CSV data.");
                // Provide more context if possible (e.g., Row number from ex.Context)
                throw new ArgumentException($"Error reading CSV data (check format and data types): {ex.Message}", ex);
            }
            // Other exceptions (IOException, etc.) will be caught by the main try-catch
        }

        private async Task<List<EvJourneyUploadDto>> ParseJsonAsync(Stream stream)
        {
            try
            {
                // Configure JsonSerializer options if needed (e.g., PropertyNameCaseInsensitive)
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };
                var records = await JsonSerializer.DeserializeAsync<List<EvJourneyUploadDto>>(stream, options);
                return records ?? new List<EvJourneyUploadDto>(); // Return empty list if JSON is null/empty array
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "Error parsing JSON data.");
                throw new ArgumentException($"Invalid JSON format: {ex.Message}", ex);
            }
            // Other exceptions (IOException, etc.) will be caught by the main try-catch
        }

        // --- Helper Method for Validation ---

        private List<string> ValidateRecord(EvJourneyUploadDto record, int lineNumber)
        {
            var errors = new List<string>();

            if (record.DistanceKm <= 0)
            {
                errors.Add($"Line {lineNumber}: DistanceKm must be greater than 0.");
            }
            if (record.StartTime == default(DateTime))
            {
                errors.Add($"Line {lineNumber}: StartTime is required and must be a valid date/time.");
            }
            if (record.EndTime == default(DateTime))
            {
                errors.Add($"Line {lineNumber}: EndTime is required and must be a valid date/time.");
            }
            if (record.EndTime <= record.StartTime)
            {
                errors.Add($"Line {lineNumber}: EndTime must be after StartTime.");
            }
            if (string.IsNullOrWhiteSpace(record.VehicleModel))
            {
                errors.Add($"Line {lineNumber}: VehicleModel is required.");
            }
            // Add other specific validations as needed

            return errors;
        }
    }
}
