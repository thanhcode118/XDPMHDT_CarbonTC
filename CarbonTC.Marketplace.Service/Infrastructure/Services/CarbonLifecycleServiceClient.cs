using Application.Common.DTOs;
using Application.Common.Interfaces;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace Infrastructure.Services
{
    public class CarbonLifecycleServiceClient : ICarbonLifecycleServiceClient
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<CarbonLifecycleServiceClient> _logger;

        public CarbonLifecycleServiceClient(HttpClient httpClient, ILogger<CarbonLifecycleServiceClient> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
        }

        public async Task<CVAStandardDto?> GetCVAStandardsAsync(Guid creditId, CancellationToken cancellationToken = default)
        {
            try
            {
                var response = await _httpClient.GetAsync($"/api/carbon-lifecycle/cva-standards?creditId={creditId}", cancellationToken);
                response.EnsureSuccessStatusCode();

                var content = await response.Content.ReadAsStringAsync(cancellationToken);
                return JsonSerializer.Deserialize<CVAStandardDto>(content);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching CVA standards for credit {CreditId}", creditId);
                throw;
            }
        }
    }
}