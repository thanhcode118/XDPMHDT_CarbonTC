namespace CarbonTC.CarbonLifecycle.Service.Models.DTOs
{
    // DTO trả về thông tin chi tiết của một yêu cầu xác minh.
    public class VerificationRequestResponseDto
    {
        public Guid RequestId { get; set; }
        public Guid OwnerId { get; set; }
        public Guid BatchId { get; set; }
        public Guid StandardId { get; set; }
        public string Status { get; set; }
        public Guid? ReviewedBy { get; set; } // CVA User ID
        public DateTime SubmittedAt { get; set; }
        public DateTime? ReviewedAt { get; set; }
        public string Remarks { get; set; }
    }
}