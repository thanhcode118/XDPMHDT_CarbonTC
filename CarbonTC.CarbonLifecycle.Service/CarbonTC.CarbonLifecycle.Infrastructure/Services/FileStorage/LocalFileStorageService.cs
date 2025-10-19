using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using CarbonTC.CarbonLifecycle.Application.Abstractions.Storage;
using CarbonTC.CarbonLifecycle.Infrastructure.Configuration;

namespace CarbonTC.CarbonLifecycle.Infrastructure.Services.FileStorage
{
    public class LocalFileStorageService : IFileStorageService
    {
        private readonly FileStorageSettings _settings;
        private readonly ILogger<LocalFileStorageService> _logger;

        public LocalFileStorageService(
            IOptions<FileStorageSettings> settings,
            ILogger<LocalFileStorageService> logger)
        {
            _settings = settings?.Value ?? throw new ArgumentNullException(nameof(settings));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));

            EnsureRootDirectoryExists();
        }

        private void EnsureRootDirectoryExists()
        {
            if (!Directory.Exists(_settings.RootPath))
            {
                Directory.CreateDirectory(_settings.RootPath);
                _logger.LogInformation("Created root storage directory: {RootPath}", _settings.RootPath);
            }
        }

        public async Task<string> SaveFileAsync(string fileName, Stream content, string userId, string contentType = null)
        {
            ValidateFileName(fileName);
            ValidateFileSize(content);
            ValidateFileExtension(fileName);

            if (string.IsNullOrWhiteSpace(userId))
                throw new ArgumentException("User ID cannot be null or empty", nameof(userId));

            try
            {
                var filePath = GenerateFilePath(fileName, userId);
                var directory = Path.GetDirectoryName(filePath);

                if (!Directory.Exists(directory))
                {
                    Directory.CreateDirectory(directory);
                }

                using (var fileStream = new FileStream(filePath, FileMode.Create, FileAccess.Write, FileShare.None))
                {
                    content.Position = 0;
                    await content.CopyToAsync(fileStream);
                }

                _logger.LogInformation(
                    "File saved successfully. Path: {FilePath}, Size: {Size} bytes, User: {UserId}",
                    filePath,
                    content.Length,
                    userId
                );

                return filePath;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to save file: {FileName}, User: {UserId}", fileName, userId);
                throw new InvalidOperationException($"Failed to save file: {fileName}", ex);
            }
        }

        public async Task<Stream> GetFileAsync(string filePath)
        {
            if (string.IsNullOrWhiteSpace(filePath))
                throw new ArgumentException("File path cannot be null or empty", nameof(filePath));

            if (!File.Exists(filePath))
            {
                _logger.LogWarning("File not found: {FilePath}", filePath);
                throw new FileNotFoundException($"File not found: {filePath}");
            }

            try
            {
                var memoryStream = new MemoryStream();
                using (var fileStream = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.Read))
                {
                    await fileStream.CopyToAsync(memoryStream);
                }
                memoryStream.Position = 0;

                _logger.LogInformation("File retrieved successfully: {FilePath}", filePath);
                return memoryStream;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve file: {FilePath}", filePath);
                throw new InvalidOperationException($"Failed to retrieve file: {filePath}", ex);
            }
        }

        public Task DeleteFileAsync(string filePath)
        {
            if (string.IsNullOrWhiteSpace(filePath))
                throw new ArgumentException("File path cannot be null or empty", nameof(filePath));

            try
            {
                if (File.Exists(filePath))
                {
                    File.Delete(filePath);
                    _logger.LogInformation("File deleted successfully: {FilePath}", filePath);
                }
                else
                {
                    _logger.LogWarning("File not found for deletion: {FilePath}", filePath);
                }

                return Task.CompletedTask;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to delete file: {FilePath}", filePath);
                throw new InvalidOperationException($"Failed to delete file: {filePath}", ex);
            }
        }

        public Task<bool> FileExistsAsync(string filePath)
        {
            if (string.IsNullOrWhiteSpace(filePath))
                return Task.FromResult(false);

            return Task.FromResult(File.Exists(filePath));
        }

        public Task<FileMetadata> GetFileMetadataAsync(string filePath)
        {
            if (string.IsNullOrWhiteSpace(filePath))
                throw new ArgumentException("File path cannot be null or empty", nameof(filePath));

            if (!File.Exists(filePath))
                throw new FileNotFoundException($"File not found: {filePath}");

            try
            {
                var fileInfo = new FileInfo(filePath);
                var metadata = new FileMetadata
                {
                    FileName = fileInfo.Name,
                    FilePath = filePath,
                    FileSizeBytes = fileInfo.Length,
                    ContentType = GetContentType(fileInfo.Extension),
                    CreatedAt = fileInfo.CreationTimeUtc,
                    LastModifiedAt = fileInfo.LastWriteTimeUtc,
                    UserId = ExtractUserIdFromPath(filePath)
                };

                return Task.FromResult(metadata);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get file metadata: {FilePath}", filePath);
                throw new InvalidOperationException($"Failed to get file metadata: {filePath}", ex);
            }
        }

        public Task<IEnumerable<string>> ListUserFilesAsync(string userId, DateTime? fromDate = null, DateTime? toDate = null)
        {
            if (string.IsNullOrWhiteSpace(userId))
                throw new ArgumentException("User ID cannot be null or empty", nameof(userId));

            try
            {
                var userDirectory = Path.Combine(_settings.RootPath);
                if (!Directory.Exists(userDirectory))
                {
                    return Task.FromResult(Enumerable.Empty<string>());
                }

                var files = Directory.GetFiles(userDirectory, "*.*", SearchOption.AllDirectories)
                    .Where(f => f.Contains($"user_{userId}"))
                    .AsEnumerable();

                if (fromDate.HasValue || toDate.HasValue)
                {
                    files = files.Where(f =>
                    {
                        var fileInfo = new FileInfo(f);
                        var createdDate = fileInfo.CreationTimeUtc;

                        if (fromDate.HasValue && createdDate < fromDate.Value)
                            return false;

                        if (toDate.HasValue && createdDate > toDate.Value)
                            return false;

                        return true;
                    });
                }

                var result = files.OrderByDescending(f => new FileInfo(f).CreationTimeUtc).ToList();

                _logger.LogInformation(
                    "Listed {Count} files for user: {UserId}",
                    result.Count,
                    userId
                );

                return Task.FromResult<IEnumerable<string>>(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to list files for user: {UserId}", userId);
                throw new InvalidOperationException($"Failed to list files for user: {userId}", ex);
            }
        }

        private string GenerateFilePath(string fileName, string userId)
        {
            var now = DateTime.UtcNow;
            var folderStructure = now.ToString(_settings.FolderStructure);
            var sanitizedFileName = SanitizeFileName(fileName);
            var uniqueFileName = $"{now:HHmmss}_{Guid.NewGuid():N}_{sanitizedFileName}";

            var path = Path.Combine(
                _settings.RootPath,
                folderStructure,
                $"user_{userId}",
                uniqueFileName
            );

            return path;
        }

        private string SanitizeFileName(string fileName)
        {
            var invalidChars = Path.GetInvalidFileNameChars();
            return string.Join("_", fileName.Split(invalidChars, StringSplitOptions.RemoveEmptyEntries));
        }

        private void ValidateFileName(string fileName)
        {
            if (string.IsNullOrWhiteSpace(fileName))
                throw new ArgumentException("File name cannot be null or empty", nameof(fileName));

            if (fileName.Length > 255)
                throw new ArgumentException("File name is too long (max 255 characters)", nameof(fileName));
        }

        private void ValidateFileSize(Stream content)
        {
            if (content == null)
                throw new ArgumentNullException(nameof(content));

            if (content.Length > _settings.MaxFileSizeBytes)
            {
                throw new InvalidOperationException(
                    $"File size ({content.Length} bytes) exceeds maximum allowed size ({_settings.MaxFileSizeBytes} bytes)"
                );
            }
        }

        private void ValidateFileExtension(string fileName)
        {
            var extension = Path.GetExtension(fileName)?.ToLowerInvariant();
            if (string.IsNullOrWhiteSpace(extension))
                throw new ArgumentException("File must have an extension", nameof(fileName));

            if (!_settings.AllowedFileExtensions.Contains(extension))
            {
                throw new InvalidOperationException(
                    $"File extension '{extension}' is not allowed. Allowed extensions: {string.Join(", ", _settings.AllowedFileExtensions)}"
                );
            }
        }

        private string GetContentType(string extension)
        {
            return extension?.ToLowerInvariant() switch
            {
                ".json" => "application/json",
                ".csv" => "text/csv",
                ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                ".pdf" => "application/pdf",
                _ => "application/octet-stream"
            };
        }

        private string ExtractUserIdFromPath(string filePath)
        {
            try
            {
                var parts = filePath.Split(Path.DirectorySeparatorChar);
                var userFolder = parts.FirstOrDefault(p => p.StartsWith("user_"));
                return userFolder?.Replace("user_", "") ?? "unknown";
            }
            catch
            {
                return "unknown";
            }
        }
    }
}