using Application.Common.Features.Transactions.DTOs;

namespace Application.Common.Interfaces
{
    public interface IExcelService
    {
        Task<byte[]> ExportTransactionStatementAsync(
            List<TransactionDto> transactions,
            Guid currentUserId, 
            DateTime startDate,
            DateTime endDate);
    }
}
