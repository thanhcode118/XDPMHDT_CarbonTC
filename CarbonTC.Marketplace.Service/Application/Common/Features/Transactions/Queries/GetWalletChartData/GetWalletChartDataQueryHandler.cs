using Application.Common.DTOs;
using Application.Common.Interfaces;
using Domain.Common.Response;
using Domain.Enum;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Globalization;
namespace Application.Common.Features.Transactions.Queries.GetWalletChartData
{
    public class GetWalletChartDataQueryHandler : IRequestHandler<GetWalletChartDataQuery, Result<ChartDataResponseDto>>
    {
        private readonly ICurrentUserService _currentUser;
        private readonly IApplicationDbContext _dbContext;

        public GetWalletChartDataQueryHandler(ICurrentUserService currentUser, IApplicationDbContext dbContext)
        {
            _currentUser = currentUser;
            _dbContext = dbContext;
        }

        public async Task<Result<ChartDataResponseDto>> Handle(GetWalletChartDataQuery request, CancellationToken cancellationToken)
        {
            if (_currentUser.UserId is not Guid userId)
            {
                return Result<ChartDataResponseDto>.Failure<ChartDataResponseDto>(new Error("NOT_LOGIN", "User not found"));
            }

            switch (request.Period)
            {
                case ChartPeriod.Week:
                    return await GetWeekDataAsync(userId, cancellationToken);
                case ChartPeriod.Month:
                    return await GetMonthDataAsync(userId, cancellationToken);
                case ChartPeriod.Year:
                    return await GetYearDataAsync(userId, cancellationToken); 
                default:
                    return await GetWeekDataAsync(userId, cancellationToken);
            }
        }

        private async Task<Result<ChartDataResponseDto>> GetWeekDataAsync(Guid userId, CancellationToken cancellationToken)
        {
            var labels = new List<string> { "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật" };

            var earnedData = new decimal[7];
            var soldData = new decimal[7];

            var now = DateTime.UtcNow;

            int diff = (7 + (int)now.DayOfWeek - (int)DayOfWeek.Monday) % 7;
            var startOfWeek = now.AddDays(-1 * diff).Date; 
            var endOfWeek = startOfWeek.AddDays(7); 

            var transactionsInWeek = await _dbContext.Transactions
                .Where(t => (t.BuyerId == userId || t.SellerId == userId) &&
                            t.CreatedAt >= startOfWeek &&
                            t.CreatedAt < endOfWeek)
                .AsNoTracking()
                .ToListAsync(cancellationToken);

            foreach (var tx in transactionsInWeek)
            {
                int dayIndex = (int)tx.CreatedAt.DayOfWeek;
                if (dayIndex == 0) dayIndex = 6;
                else dayIndex -= 1; 

                if (tx.BuyerId == userId)
                {
                    earnedData[dayIndex]++;
                }

                if (tx.SellerId == userId)
                {
                    soldData[dayIndex]++;
                }
            }

            var response = new ChartDataResponseDto
            {
                Labels = labels,
                Datasets = new List<ChartDatasetDto>
                {
                    new ChartDatasetDto
                    {
                        Label = "Tín chỉ kiếm được",
                        Data = earnedData.ToList() 
                    },
                    new ChartDatasetDto
                    {
                        Label = "Tín chỉ đã bán",
                        Data = soldData.ToList() 
                    }
                }
            };

            return Result<ChartDataResponseDto>.Success(response);
        }

        private async Task<Result<ChartDataResponseDto>> GetMonthDataAsync(Guid userId, CancellationToken cancellationToken)
        {
            int daysInPeriod = 30;
            var now = DateTime.UtcNow.Date;
            var startDate = now.AddDays(-daysInPeriod + 1);
            var endDate = now.AddDays(1); 

            var labels = new List<string>();
            var earnedData = new decimal[daysInPeriod];
            var soldData = new decimal[daysInPeriod];

            for (int i = 0; i < daysInPeriod; i++)
            {
                labels.Add(startDate.AddDays(i).ToString("dd/MM"));
            }

            var transactions = await _dbContext.Transactions
                .Where(t => (t.BuyerId == userId || t.SellerId == userId) &&
                            t.CreatedAt >= startDate &&
                            t.CreatedAt < endDate)
                .AsNoTracking()
                .ToListAsync(cancellationToken);

            foreach (var tx in transactions)
            {
                int dayIndex = (tx.CreatedAt.Date - startDate).Days;

                if (dayIndex < 0 || dayIndex >= daysInPeriod) continue;

                if (tx.BuyerId == userId)
                {
                    earnedData[dayIndex]++;
                }

                if (tx.SellerId == userId)
                {
                    soldData[dayIndex]++;
                }
            }

            var response = new ChartDataResponseDto
            {
                Labels = labels,
                Datasets = new List<ChartDatasetDto>
                {
                    new ChartDatasetDto { Label = "Tín chỉ kiếm được", Data = earnedData.ToList() },
                    new ChartDatasetDto { Label = "Tín chỉ đã bán", Data = soldData.ToList() }
                }
            };

            return Result<ChartDataResponseDto>.Success(response);
        }

        private async Task<Result<ChartDataResponseDto>> GetYearDataAsync(Guid userId, CancellationToken cancellationToken)
        {
            int monthsInPeriod = 12;
            var now = DateTime.UtcNow.Date;
            var startDate = new DateTime(now.Year, now.Month, 1).AddMonths(-monthsInPeriod + 1);
            var endDate = new DateTime(now.Year, now.Month, 1).AddMonths(1);

            var labels = new List<string>();
            var earnedData = new decimal[monthsInPeriod];
            var soldData = new decimal[monthsInPeriod];

            var culture = new CultureInfo("vi-VN");

            for (int i = 0; i < monthsInPeriod; i++)
            {
                labels.Add(culture.DateTimeFormat.GetAbbreviatedMonthName(startDate.AddMonths(i).Month));
            }

            var transactions = await _dbContext.Transactions
                .Where(t => (t.BuyerId == userId || t.SellerId == userId) &&
                            t.CreatedAt >= startDate &&
                            t.CreatedAt < endDate)
                .AsNoTracking()
                .ToListAsync(cancellationToken);

            foreach (var tx in transactions)
            {
                int monthIndex = (tx.CreatedAt.Year - startDate.Year) * 12 + tx.CreatedAt.Month - startDate.Month;

                if (monthIndex < 0 || monthIndex >= monthsInPeriod) continue;

                if (tx.BuyerId == userId)
                {
                    earnedData[monthIndex]++;
                }

                if (tx.SellerId == userId)
                {
                    soldData[monthIndex]++;
                }
            }

            var response = new ChartDataResponseDto
            {
                Labels = labels,
                Datasets = new List<ChartDatasetDto>
                {
                    new ChartDatasetDto { Label = "Tín chỉ kiếm được", Data = earnedData.ToList() },
                    new ChartDatasetDto { Label = "Tín chỉ đã bán", Data = soldData.ToList() }
                }
            };

            return Result<ChartDataResponseDto>.Success(response);
        }
    }
}