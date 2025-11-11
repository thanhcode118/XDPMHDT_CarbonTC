using Application.Common.DTOs;
using Application.Common.Interfaces;
using Microsoft.Extensions.Logging;
using SharedLibrary.Model;
using System.Net.Http.Headers;
using System.Text.Json;
using Microsoft.AspNetCore.Http;

namespace Infrastructure.Services
{
    public class CarbonLifecycleServiceClient : ICarbonLifecycleServiceClient
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<CarbonLifecycleServiceClient> _logger;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly JsonSerializerOptions _jsonOptions;

        public CarbonLifecycleServiceClient(
            HttpClient httpClient,
            ILogger<CarbonLifecycleServiceClient> logger,
            IHttpContextAccessor httpContextAccessor)
        {
            _httpClient = httpClient;
            _logger = logger;
            _httpContextAccessor = httpContextAccessor;

            _jsonOptions = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };
        }

        public async Task<CVAStandardDto?> GetCVAStandardsAsync(Guid creditId, CancellationToken cancellationToken = default)
        {
            try
            {
                var authHeader = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"].ToString();

                if (!string.IsNullOrEmpty(authHeader))
                {
                    _httpClient.DefaultRequestHeaders.Authorization =
                        new AuthenticationHeaderValue("Bearer", authHeader.Replace("Bearer ", ""));
                }
                else
                {
                    _logger.LogWarning("Missing Authorization header when calling CarbonLifecycleService");
                    return null;
                }

                using var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
                cts.CancelAfter(TimeSpan.FromSeconds(5)); 

                var response = await _httpClient.GetAsync($"/api/CarbonCredits/{creditId}/standard", cts.Token);

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning("CarbonLifecycleService returned {StatusCode}", response.StatusCode);
                    return null;
                }

                var contentStream = await response.Content.ReadAsStreamAsync(cts.Token);
                var apiResponse = await JsonSerializer.DeserializeAsync<ApiResponse<CVAStandardDto>>(
                    contentStream,
                    _jsonOptions,
                    cts.Token
                );

                if (apiResponse?.Success != true || apiResponse.Data == null)
                {
                    _logger.LogWarning("Invalid API response from CarbonLifecycleService");
                    return null;
                }

                return apiResponse.Data;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching CVA standards for credit {CreditId}", creditId);
                return null;
            }
        }
    }
}
