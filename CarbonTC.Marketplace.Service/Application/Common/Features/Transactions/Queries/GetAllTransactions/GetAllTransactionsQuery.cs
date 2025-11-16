using Domain.Common.Models;
using Domain.Enum;
using MediatR;

namespace Application.Common.Features.Transactions.Queries.GetAllTransactions
{
    public record GetAllTransactionsQuery(
        int PageNumber = 1,
        int PageSize = 20,

        Guid? BuyerId = null,
        Guid? SellerId = null,
        Guid? ListingId = null,

        TransactionStatus? Status = null,
        DateTime? StartDate = null,
        DateTime? EndDate = null,
        decimal? MinAmount = null,
        decimal? MaxAmount = null,

        TransactionSortBy? SortBy = TransactionSortBy.CreatedAt,
        bool SortDescending = true
    ) : IRequest<PagedResult<Domain.Entities.Transactions>>
    {
        public Guid? InvolvedUserId { get; init; } = null;
    }

    public enum TransactionSortBy
    {
        CreatedAt,
        TotalAmount, 
        CompletedAt,
        Quantity
    }
}