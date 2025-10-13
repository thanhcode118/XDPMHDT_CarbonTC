namespace Application.Common.Interfaces
{
    public interface IWalletServiceClient
    {
        Task<bool> HasSufficientBalanceAsync(Guid userId, decimal amount, CancellationToken cancellationToken);
        Task<bool> ReserveFundsAsync(Guid userId, decimal amount, CancellationToken cancellationToken);
        Task<bool> CommitPaymentAsync(Guid userId, decimal amount, CancellationToken cancellationToken);
        Task<bool> RollbackReservationAsync(Guid userId, decimal amount, CancellationToken cancellationToken);
    }
}
