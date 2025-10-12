namespace CarbonTC.CarbonLifecycle.Service.Models.DTOs
{
    // DTO hiển thị thông tin của một báo cáo kiểm toán.
    public class AuditReportDto
    {
        public Guid ReportId { get; set; }
        public Guid RequestId { get; set; }
        public Guid GeneratedBy { get; set; }
        public string ReportType { get; set; }
        public string FilePath { get; set; }
        public string Findings { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}