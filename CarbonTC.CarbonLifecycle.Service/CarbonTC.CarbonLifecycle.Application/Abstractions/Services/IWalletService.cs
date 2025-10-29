// File: CarbonTC.CarbonLifecycle.Application/Abstractions/Services/IWalletService.cs
// (Tạo thư mục Abstractions/Services nếu chưa có)
using System;
using System.Threading.Tasks;
using CarbonTC.CarbonLifecycle.Application.DTOs; // Giả sử có WalletCreditMintDto

namespace CarbonTC.CarbonLifecycle.Application.Abstractions.Services
{
    // DTO cho việc gọi API mint credit của Wallet Service
    public class WalletCreditMintDto
    {
        public string UserId { get; set; } = string.Empty;
        public decimal Amount { get; set; } // Số lượng tín chỉ
        public Guid SourceVerificationRequestId { get; set; }
        public Guid SourceBatchId { get; set; }
        public DateTime IssuedAt { get; set; }
        // Thêm các trường khác nếu Wallet Service yêu cầu
    }

    // DTO kết quả trả về từ Wallet Service (nếu có)
    public class WalletMintResponseDto
    {
        public bool Success { get; set; }
        public string? Message { get; set; }
        public string? WalletTransactionId { get; set; } // ID giao dịch bên Wallet Service (nếu có)
        // Thêm các trường khác nếu cần
    }


    public interface IWalletService
    {
        /// <summary>
        /// Gọi API của Wallet Service để ghi nhận (mint) tín chỉ carbon lần đầu.
        /// </summary>
        /// <param name="mintInfo">Thông tin cần thiết để mint tín chỉ.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>Kết quả từ Wallet Service.</returns>
        Task<WalletMintResponseDto> MintInitialCreditsAsync(WalletCreditMintDto mintInfo, CancellationToken cancellationToken);
    }
}