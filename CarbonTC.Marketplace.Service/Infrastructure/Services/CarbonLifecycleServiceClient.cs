using Application.Common.DTOs;
using Application.Common.Interfaces;
using Microsoft.Extensions.Logging;
using SharedLibrary.Model;
using System.Text.Json;

namespace Infrastructure.Services
{
    public class CarbonLifecycleServiceClient : ICarbonLifecycleServiceClient
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<CarbonLifecycleServiceClient> _logger;
        private readonly JsonSerializerOptions _jsonOptions;

        public CarbonLifecycleServiceClient(HttpClient httpClient, ILogger<CarbonLifecycleServiceClient> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
            _jsonOptions = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };
        }

        public async Task<CVAStandardDto?> GetCVAStandardsAsync(Guid creditId, CancellationToken cancellationToken = default)
        {
            try
            {
                var response = await _httpClient.GetAsync($"/api/CarbonCredits/{creditId}/standard", cancellationToken);
                response.EnsureSuccessStatusCode();

                var content = await response.Content.ReadAsStringAsync(cancellationToken);
                var apiResponse = JsonSerializer.Deserialize<ApiResponse<CVAStandardDto>>(content, _jsonOptions);

                if (apiResponse != null && apiResponse.Success)
                {
                    return apiResponse.Data;
                }

                _logger.LogWarning("API call successful but 'Success' flag was false or response was null.");
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching CVA standards for credit {CreditId}", creditId);
                return null;
            }
        }
    }
}