using Domain.Common.Response;
using MediatR;
using System.Text.Json.Serialization;

namespace Application.Common.Features.Listings.Commands.UpdateBalance
{
    public record UpdateBalanceCommand: IRequest<Result>
    {
        [JsonPropertyName("userId")]
        public Guid UserId { get; init; }
        [JsonPropertyName("newTotalBalance")]
        public decimal NewTotalBalance { get; init; }
    }
}
