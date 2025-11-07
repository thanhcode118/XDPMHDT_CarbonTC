using Application.Common.DTOs;
using Application.Common.Interfaces;
using Domain.Common.Response;
using Domain.Enum;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Polly;

namespace Application.Common.Features.Transactions.Queries.GetDashboardSummary
{
    public class GetDashboardSummaryQueryHandler : IRequestHandler<GetDashboardSummaryQuery, Result<TransactionSummaryDto>>
    {
        private readonly ICurrentUserService _currentUser;
        private readonly IApplicationDbContext _dbContext;

        public GetDashboardSummaryQueryHandler(ICurrentUserService currentUser, IApplicationDbContext dbContext)
        {
            _currentUser = currentUser;
            _dbContext = dbContext;
        }

        public async Task<Result<TransactionSummaryDto>> Handle(GetDashboardSummaryQuery request, CancellationToken cancellationToken)
        {
            var userId = _currentUser.UserId;

            if (userId == null)
            {
                return Result<TransactionSummaryDto>.Failure<TransactionSummaryDto>(new Error("NOTLOGIN", "User not found"));
            }

            var now = DateTime.UtcNow;
            var currentPeriodStart = now.AddDays(-30);
            var currentPeriodEnd = now;
            var previousPeriodStart = now.AddDays(-60);
            var previousPeriodEnd = currentPeriodStart;

            var currentStatsTask = await _dbContext.Transactions
                .Where(t => t.CreatedAt >= currentPeriodStart && t.CreatedAt < currentPeriodEnd)
                .Where(t => t.BuyerId == userId || t.SellerId == userId)
                .GroupBy(t => 1)
                .Select(g => new
                {
                    TotalTransactions = g.Count(),
                    SuccessfulTransactions = g.Count(t => t.Status == TransactionStatus.Success),
                    PendingTransactions = g.Count(t => t.Status == TransactionStatus.Pending),
                    TotalRevenue = g.Where(t => t.Status == TransactionStatus.Success && t.SellerId == userId)
                            .Sum(t => t.TotalAmount)
                })
                .FirstOrDefaultAsync(cancellationToken)
                ?? new { TotalTransactions = 0, SuccessfulTransactions = 0, PendingTransactions = 0, TotalRevenue = 0m }; ;

            var previousStatsTask = await _dbContext.Transactions
                .Where(t => t.BuyerId == userId || t.SellerId == userId)
                .Where(t => t.CreatedAt >= previousPeriodStart && t.CreatedAt < previousPeriodEnd)
                .GroupBy(t => 1)
                .Select(g => new
                {
                    TotalTransactions = g.Count(),
                    SuccessfulTransactions = g.Count(t => t.Status == TransactionStatus.Success),
                    PendingTransactions = g.Count(t => t.Status == TransactionStatus.Pending),
                    TotalRevenue = g.Where(t => t.Status == TransactionStatus.Success && t.SellerId == userId)
                            .Sum(t => t.TotalAmount)
                })
                .FirstOrDefaultAsync(cancellationToken)
                ?? new { TotalTransactions = 0, SuccessfulTransactions = 0, PendingTransactions = 0, TotalRevenue = 0m }; ;

            var dto = new TransactionSummaryDto
            {
                TotalTransactions = currentStatsTask.TotalTransactions,
                TotalTransactionsChange = CalculateChange(currentStatsTask.TotalTransactions, previousStatsTask.TotalTransactions),

                SuccessfulTransactions = currentStatsTask.SuccessfulTransactions,
                SuccessfulTransactionsChange = CalculateChange(currentStatsTask.SuccessfulTransactions, previousStatsTask.SuccessfulTransactions),

                PendingTransactions = currentStatsTask.PendingTransactions,
                PendingTransactionsChange = CalculateChange(currentStatsTask.PendingTransactions, previousStatsTask.PendingTransactions),

                TotalRevenue = currentStatsTask.TotalRevenue,
                TotalRevenueChange = CalculateChange(currentStatsTask.TotalRevenue, previousStatsTask.TotalRevenue)
            };

            return Result<TransactionSummaryDto>.Success(dto);
        }

        private decimal CalculateChange(decimal current, decimal previous)
        {
            if (previous == 0)
            {
                return (current > 0) ? 100.0m : 0.0m;
            }
            return Math.Round(((current - previous) / previous) * 100.0m, 2);
        }
    }
}
