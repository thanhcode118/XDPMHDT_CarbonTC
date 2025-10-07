namespace CarbonTC.CarbonLifecycle.Service.Models.Enums
{
    public enum VerificationRequestStatus
    {
        Pending,      // Đang chờ CVA xem xét
        UnderReview,  // Đang trong quá trình CVA xem xét
        Approved,     // Đã được CVA duyệt
        Rejected      // Đã bị CVA từ chối
    }
}