using Application.Common.DTOs;
using Domain.Common.Response;
using MediatR;

namespace Application.Common.Features.Transactions.Queries.GetDashboardWalletSummary
{
    public class GetDashboardWalletSummaryQuery: IRequest<Result<DashboardWalletSummaryDto>>
    {
    }
}
