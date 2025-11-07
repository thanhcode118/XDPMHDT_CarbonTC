using Application.Common.DTOs;
using Domain.Common.Response;
using Domain.Enum;
using MediatR;

namespace Application.Common.Features.Transactions.Queries.GetWalletChartData
{
    public record GetWalletChartDataQuery(ChartPeriod Period) : IRequest<Result<ChartDataResponseDto>>;
}