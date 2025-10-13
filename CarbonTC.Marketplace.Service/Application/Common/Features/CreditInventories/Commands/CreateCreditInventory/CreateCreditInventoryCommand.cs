using Domain.Common.Response;
using MediatR;

namespace Application.Common.Features.CreditInventories.Commands.CreateCreditInventory
{
    public record CreateCreditInventoryCommand : IRequest<Result<Guid>>
    {
        public Guid CreditId { get; init; }
        public decimal TotalAmount { get; init; }
    }
}
