namespace CarbonTC.CarbonLifecycle.Service.Models.DTOs
{
    // DTO để CVA tạo một báo cáo kiểm toán.
    public class AuditReportCreateDto
    {
        public Guid RequestId { get; set; }

        public Guid GeneratedBy { get; set; } // CVA User ID

        public string ReportType { get; set; }

        public string Findings { get; set; } // Có thể là một chuỗi JSON

        // IFormFile có thể được thêm vào đây nếu bạn muốn upload file báo cáo trực tiếp
        // public IFormFile ReportFile { get; set; }
    }
}