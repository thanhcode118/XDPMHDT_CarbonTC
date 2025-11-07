using MediatR;

namespace Application.Common.Features.Listings.Commands.WarmUpUserBalance
{
    public record WarmUpUserBalanceCommand(Guid UserId): IRequest;
}
