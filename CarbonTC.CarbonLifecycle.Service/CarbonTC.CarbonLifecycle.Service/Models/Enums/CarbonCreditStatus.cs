namespace CarbonTC.CarbonLifecycle.Service.Models.Enums
{
    public enum CarbonCreditStatus
    {
        Pending,   // Đang chờ được phát hành (sau khi batch được duyệt nhưng chưa mint)
        Approved,  // Đã được CVA duyệt và phát hành (minted)
        Rejected,  // Bị từ chối
        Listed,    // Đã niêm yết trên sàn giao dịch
        Sold       // Đã được bán
    }
}