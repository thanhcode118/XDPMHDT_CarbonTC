using Domain.Common.Response;
using MediatR;
using System.Text.Json.Serialization;

namespace Application.Common.Features.CreditInventories.Commands.CreateCreditInventory
{
    public record CreateCreditInventoryCommand : IRequest<Result<Guid>>
    {
        [JsonPropertyName("creditId")]
        public Guid CreditId { get; init; }

        [JsonPropertyName("totalAmount")]
        public decimal TotalAmount { get; init; }
    }
}
