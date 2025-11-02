using Application.Common.Interfaces;
using Domain.Common.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Common.Features.Transactions.Queries.GetAllTransactions
{
    public class GetAllTransactionsQueryHandler : IRequestHandler<GetAllTransactionsQuery, PagedResult<Domain.Entities.Transactions>>
    {
        private readonly IApplicationDbContext _dbContext;

        public GetAllTransactionsQueryHandler(IApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<PagedResult<Domain.Entities.Transactions>> Handle(GetAllTransactionsQuery query, CancellationToken cancellationToken)
        {
            var queryable = _dbContext.Transactions.AsQueryable();

            if (query.BuyerId.HasValue)
            {
                queryable = queryable.Where(t => t.BuyerId == query.BuyerId.Value);
            }
            if (query.SellerId.HasValue)
            {
                queryable = queryable.Where(t => t.SellerId == query.SellerId.Value);
            }
            if (query.ListingId.HasValue)
            {
                queryable = queryable.Where(t => t.ListingId == query.ListingId.Value);
            }
            if (query.Status.HasValue)
            {
                queryable = queryable.Where(t => t.Status == query.Status.Value);
            }
            if (query.StartDate.HasValue)
            {
                queryable = queryable.Where(t => t.CreatedAt >= query.StartDate.Value);
            }
            if (query.EndDate.HasValue)
            {
                var endDate = query.EndDate.Value.Date.AddDays(1).AddTicks(-1);
                queryable = queryable.Where(t => t.CreatedAt <= endDate);
            }

            if (query.MinAmount.HasValue)
            {
                queryable = queryable.Where(t => t.TotalAmount >= query.MinAmount.Value);
            }

            if (query.MaxAmount.HasValue)
            {
                queryable = queryable.Where(t => t.TotalAmount <= query.MaxAmount.Value);
            }

            switch (query.SortBy)
            {
                case TransactionSortBy.TotalAmount:
                    queryable = query.SortDescending
                        ? queryable.OrderByDescending(t => t.TotalAmount)
                        : queryable.OrderBy(t => t.TotalAmount);
                    break;
                case TransactionSortBy.CompletedAt:
                    queryable = query.SortDescending
                        ? queryable.OrderByDescending(t => t.CompletedAt)
                        : queryable.OrderBy(t => t.CompletedAt);
                    break;
                case TransactionSortBy.Quantity:
                    queryable = query.SortDescending
                        ? queryable.OrderByDescending(t => t.Quantity)
                        : queryable.OrderBy(t => t.Quantity);
                    break;
                default: 
                    queryable = query.SortDescending
                        ? queryable.OrderByDescending(t => t.CreatedAt)
                        : queryable.OrderBy(t => t.CreatedAt);
                    break;
            }

            var totalCount = await queryable.CountAsync();

            var items = await queryable
                .Skip((query.PageNumber - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToListAsync();

            return PagedResult<Domain.Entities.Transactions>.Create(items, totalCount, query.PageNumber, query.PageSize);
        }
    }
}
