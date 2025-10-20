using Application.Common.DTOs;

namespace Application.Common.Interfaces
{
    public interface IWalletServiceClient
    {
        Task<bool> HasSufficientBalanceAsync(Guid userId, decimal amount, CancellationToken cancellationToken = default);
        Task<bool> ReserveFundsAsync(Guid userId, decimal amount, CancellationToken cancellationToken = default);
        Task<bool> CommitPaymentAsync(Guid userId, decimal amount, CancellationToken cancellationToken = default);
        Task<bool> RollbackReservationAsync(Guid userId, decimal amount, CancellationToken cancellationToken = default);
        Task<WalletDto?> GetBanlanceAsync(Guid UserId, CancellationToken cancellationToken = default);
    }
}
