using Domain.Common.Response;
using Domain.Entities;
using MediatR;

namespace Application.Common.Features.CreditInventories.Queries.GetCreditInventoryByCreditId
{
    public record GetCreditInventoryByCreditIdQuery(Guid CreditId) : IRequest<Result<CreditInventory>>;
}
