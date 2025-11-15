using Domain.Common.Response;
using MediatR;

namespace Application.Common.Features.Listings.Queries.CanWithdraw
{
    public record CanWithdrawQuery: IRequest<Result<bool>>
    {
        public Guid userId { get; init; }
        public decimal amountToWithdraw { get; init; }
    }
}
