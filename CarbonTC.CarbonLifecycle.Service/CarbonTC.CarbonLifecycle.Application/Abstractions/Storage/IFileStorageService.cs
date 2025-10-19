// Interface định nghĩa các thao tác lưu trữ tệp tin, bao gồm lưu, lấy, xóa, kiểm tra tồn tại, lấy metadata và liệt kê tệp theo người dùng
// Lớp FileMetadata chứa thông tin mô tả về tệp tin

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IO;

namespace CarbonTC.CarbonLifecycle.Application.Abstractions.Storage
{
    public interface IFileStorageService
    {
        Task<string> SaveFileAsync(string fileName, Stream content, string userId, string contentType = null);

        Task<Stream> GetFileAsync(string filePath);

        Task DeleteFileAsync(string filePath);

        Task<bool> FileExistsAsync(string filePath);

        Task<FileMetadata> GetFileMetadataAsync(string filePath);

        Task<IEnumerable<string>> ListUserFilesAsync(string userId, DateTime? fromDate = null, DateTime? toDate = null);
    }

    public class FileMetadata
    {
        public string FileName { get; set; }
        public string FilePath { get; set; }
        public long FileSizeBytes { get; set; }
        public string ContentType { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastModifiedAt { get; set; }
        public string UserId { get; set; }
    }
}

