using Application.Common.DTOs;
using Application.Common.Interfaces;
using Domain.Common.Response;
using Domain.Enum;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Common.Features.Transactions.Queries.GetDashboardWalletSummary
{
    public class GetDashboardWalletSummaryQueryHandler
        : IRequestHandler<GetDashboardWalletSummaryQuery, Result<DashboardWalletSummaryDto>>
    {
        private readonly ICurrentUserService _currentUser;
        private readonly IApplicationDbContext _dbContext;

        public GetDashboardWalletSummaryQueryHandler(ICurrentUserService currentUser, IApplicationDbContext dbContext)
        {
            _currentUser = currentUser;
            _dbContext = dbContext;
        }

        public async Task<Result<DashboardWalletSummaryDto>> Handle(GetDashboardWalletSummaryQuery request, CancellationToken cancellationToken)
        {
            if (_currentUser.UserId is not Guid userId)
                return Result<DashboardWalletSummaryDto>.Failure<DashboardWalletSummaryDto>(
                    new Error("NOT_LOGIN", "User not found or invalid"));

            var now = DateTime.UtcNow;
            var currentStart = now.AddDays(-30);
            var previousStart = now.AddDays(-60);

            var currentTxs = await GetTransactions(userId, currentStart, now, cancellationToken);
            var previousTxs = await GetTransactions(userId, previousStart, currentStart, cancellationToken);

            var currentStats = CalculateStats(currentTxs, userId);
            var previousStats = CalculateStats(previousTxs, userId);

            var dto = new DashboardWalletSummaryDto
            {
                ListingsFound = currentStats.listingsFound,
                ListingsFoundChangePercent = CalculateChangePercent(currentStats.listingsFound, previousStats.listingsFound),

                ListingsSold = currentStats.listingsSold,
                ListingsSoldChangePercent = CalculateChangePercent(currentStats.listingsSold, previousStats.listingsSold),

                AveragePrice = currentStats.averagePrice,
                AveragePriceChangePercent = CalculateChangePercent(currentStats.averagePrice, previousStats.averagePrice),

                SuccessfulTransactions = currentStats.successfulTransactions,
                SuccessfulTransactionsChangePercent = CalculateChangePercent(currentStats.successfulTransactions, previousStats.successfulTransactions)
            };

            return Result<DashboardWalletSummaryDto>.Success(dto);
        }

        private async Task<List<Domain.Entities.Transactions>> GetTransactions(Guid userId, DateTime start, DateTime end, CancellationToken token) =>
            await _dbContext.Transactions
                .Where(t => (t.BuyerId == userId || t.SellerId == userId)
                            && t.CreatedAt >= start && t.CreatedAt <= end)
                .AsNoTracking()
                .ToListAsync(token);

        private (int listingsFound, int listingsSold, decimal averagePrice, int successfulTransactions)
            CalculateStats(IEnumerable<Domain.Entities.Transactions> txs, Guid userId)
        {
            var bought = txs.Where(t => t.BuyerId == userId && t.Status == TransactionStatus.Success).ToList();

            var sold = txs.Where(t => t.SellerId == userId && t.Status == TransactionStatus.Success).ToList();

            return (
                listingsFound: bought.Count,
                listingsSold: sold.Count,   
                averagePrice: sold.Any() ? sold.Average(t => t.TotalAmount) : 0m, 
                successfulTransactions: bought.Count + sold.Count 
            );
        }

        private static decimal CalculateChangePercent(decimal current, decimal previous)
            => previous == 0 ? (current > 0 ? 100 : 0) : Math.Round(((current - previous) / previous) * 100, 2);
    }
}
