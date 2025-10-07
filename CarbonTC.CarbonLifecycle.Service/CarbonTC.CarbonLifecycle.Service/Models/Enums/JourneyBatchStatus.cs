namespace CarbonTC.CarbonLifecycle.Service.Models.Enums
{
    public enum JourneyBatchStatus
    {
        PendingCalculation, // Đang chờ tính toán CO2
        Calculated, // Đã tính toán CO2
        PendingVerification, // Đã gửi yêu cầu xác minh
        UnderReview, // Đang được CVA xem xét
        Verified, // Đã được CVA xác minh (duyệt)
        Rejected // Đã bị CVA từ chối
    }
}