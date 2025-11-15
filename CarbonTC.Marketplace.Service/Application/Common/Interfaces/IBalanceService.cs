namespace Application.Common.Interfaces
{
    public interface IBalanceService
    {
        /// <summary>
        /// Lấy số dư hiện tại (available + locked)
        /// </summary>
        /// <param name="userId"></param>
        /// <returns></returns>
        Task<(decimal available, decimal locked)> GetBalanceAsync(Guid userId);
        /// <summary>
        /// Nạp dữ liệu ví từ WalletService lên Redis
        /// </summary>
        /// <param name="userId"></param>
        /// <returns></returns>
        Task<bool> WarmUpBalanceAsync(Guid userId, DateTime? auctionEndTime = null);
        /// <summary>
        /// Tạm khoá số dư cho phiên đấu giá
        /// </summary>
        /// <param name="userId"></param>
        /// <param name="auctionId"></param>
        /// <param name="newBidAmount"></param>
        /// <returns></returns>
        Task<bool> ReserveBalanceForAuctionAsync(Guid userId, Guid auctionId, decimal newBidAmount);
        /// <summary>
        /// Giải phóng số dư đã khoá cho phiên đấu giá
        /// </summary>
        /// <param name="userId"></param>
        /// <param name="auctionId"></param>
        /// <returns></returns>
        Task ReleaseBalanceForAuctionAsync(Guid userId, Guid auctionId);
        /// <summary>
        /// Hoàn tất trừ số dư đã khoá cho phiên đấu giá
        /// </summary>
        /// <param name="userId"></param>
        /// <param name="auctionId"></param>
        /// <returns></returns>
        Task CommitBalanceForAuctionAsync(Guid userId, Guid auctionId);
        /// <summary>
        /// Lấy số dư đã khoá cho phiên đấu giá
        /// </summary>
        /// <param name="userId"></param>
        /// <param name="auctionId"></param>
        /// <returns></returns>
        Task<decimal> GetAuctionLockedAmountAsync(Guid userId, Guid auctionId);

        Task<bool> ReserveBalanceForPurchaseAsync(Guid userId, decimal amountToReserve);
        Task ReleaseBalanceForPurchaseAsync(Guid userId, decimal amountToRelease);
        Task CommitPurchaseAsync(Guid userId, decimal amountToCommit);
        /// <summary>
        /// Kiểm tra người dung có thể rút số tiền amountToWithdraw hay không
        /// </summary>
        /// <param name="userId"></param>
        /// <param name="amountToWithdraw"></param>
        /// <returns></returns>
        Task<bool> CanWithdrawAsync(Guid userId, decimal amountToWithdraw);
        /// <summary>
        /// Nạp số tiền mới + khoản chênh lệch vào available
        /// </summary>
        /// <param name="userId"></param>
        /// <param name="newTotalBalance"></param>
        /// <returns></returns>
        Task<bool> UpdateBalanceAfterDepositOrWithdrawAsync(Guid userId, decimal newTotalBalance);
    }
}
