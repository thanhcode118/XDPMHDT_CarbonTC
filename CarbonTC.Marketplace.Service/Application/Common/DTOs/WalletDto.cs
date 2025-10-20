using System.Text.Json.Serialization;

namespace Application.Common.DTOs
{
    public class WalletDto
    {
        [JsonPropertyName("available")]
        public decimal Available { get; set; }
    }
}
