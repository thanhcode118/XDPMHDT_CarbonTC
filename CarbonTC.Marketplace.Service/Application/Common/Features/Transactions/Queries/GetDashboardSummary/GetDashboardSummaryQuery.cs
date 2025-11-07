using Application.Common.DTOs;
using Domain.Common.Response;
using MediatR;

namespace Application.Common.Features.Transactions.Queries.GetDashboardSummary
{
    public class GetDashboardSummaryQuery: IRequest<Result<TransactionSummaryDto>>
    {
    }
}
