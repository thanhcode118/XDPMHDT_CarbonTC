using Domain.Common.Response;
using MediatR;
using System.Text.Json.Serialization;

namespace Application.Common.Features.Transactions.Commands
{
    public record TransactionCompletedCommand : IRequest<Result>
    {
        [JsonPropertyName("transactionId")]
        public string TransactionId { get; init; }

        [JsonPropertyName("status")]
        public string Status { get; init; }

        [JsonPropertyName("certificateId")]
        public long? CertificateId { get; init; }

        [JsonPropertyName("message")]
        public string? Message { get; init; }

        [JsonPropertyName("completedAt")]
        public DateTime CompletedAt { get; init; }
    }
}