namespace CarbonTC.CarbonLifecycle.Application.DTOs
{
    public class FileUploadResultDto
    {
        public int TotalRecords { get; set; }
        public int SuccessfulRecords { get; set; }
        public int FailedRecords => TotalRecords - SuccessfulRecords;
        public List<string> Errors { get; set; } = new List<string>();
        public string? StoredFilePath { get; set; } // Tùy chọn: Đường dẫn nếu tệp gốc được lưu
    }
}