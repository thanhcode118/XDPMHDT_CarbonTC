using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarbonTC.CarbonLifecycle.Infrastructure.Configuration
{
    public class FileStorageSettings
    {
        public string RootPath { get; set; } = string.Empty;
        public long MaxFileSizeBytes { get; set; } = 52428800; // 50MB default
        public List<string> AllowedFileExtensions { get; set; } = new List<string> { ".json", ".csv", ".xlsx", ".pdf" };
        public string FolderStructure { get; set; } = "yyyy/MM/dd"; // Date-based folder structure
        public bool EnableCompression { get; set; } = false;
    }
}
