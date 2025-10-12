namespace CarbonTC.CarbonLifecycle.Service.Models.DTOs
{
    // DTO để CVA Admin duyệt hoặc từ chối một yêu cầu xác minh.
    public class VerificationRequestReviewDto
    {
        public bool IsApproved { get; set; } // true = Approved, false = Rejected
        public string Remarks { get; set; } // Lý do, bắt buộc nếu IsApproved = false
    }
}