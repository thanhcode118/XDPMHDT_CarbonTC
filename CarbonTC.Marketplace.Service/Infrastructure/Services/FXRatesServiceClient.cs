using Application.Common.DTOs;
using Application.Common.Interfaces;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
// Bỏ 'CultureInfo' vì chúng ta không còn 'amount' trong key

namespace Infrastructure.Services
{
    public class FXRatesServiceClient : IFXRatesServiceClient
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<FXRatesServiceClient> _logger;
        private readonly JsonSerializerOptions _jsonOptions;
        private readonly ICacheService _cacheService;

        public FXRatesServiceClient(
            HttpClient httpClient,
            ILogger<FXRatesServiceClient> logger,
            ICacheService cacheService)
        {
            _httpClient = httpClient;
            _logger = logger;
            _cacheService = cacheService;
            _jsonOptions = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };
        }

        // Triển khai phương thức mới từ Interface
        public async Task<decimal?> GetRateAsync(
            string? fromCurrency = "usd",
            string? toCurrency = "vnd",
            CancellationToken cancellationToken = default)
        {
            var date = DateOnly.FromDateTime(DateTime.UtcNow);

            string cacheKey = $"fxrate:{date:yyyy-MM-dd}:{fromCurrency}:{toCurrency}";

            try
            {
                var cachedRate = await _cacheService.GetStringAsync<decimal?>(cacheKey);

                if (cachedRate.HasValue)
                {
                    _logger.LogInformation("Cache HIT for FX rate: {Key}", cacheKey);
                    return cachedRate.Value;
                }

                _logger.LogInformation("Cache MISS for FX rate: {Key}", cacheKey);

                var response = await _httpClient.GetAsync(
                    $"/convert?date={date:yyyy-MM-dd}&from={fromCurrency}&to={toCurrency}&amount=1", 
                    cancellationToken);

                response.EnsureSuccessStatusCode();

                var contentStream = await response.Content.ReadAsStreamAsync(cancellationToken);

                var apiResponse = await JsonSerializer.DeserializeAsync<FXRateResponseDto>(
                    contentStream,
                    _jsonOptions,
                    cancellationToken: cancellationToken);

                if (apiResponse != null && apiResponse.Success)
                {
                    var rate = apiResponse.Info.Rate; 
                    var ttl = TimeSpan.FromDays(1);

                    await _cacheService.SetStringAsync(cacheKey, rate, ttl);

                    return rate;
                }

                _logger.LogWarning("Failed to get rate from API response for {Key}", cacheKey);
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get currency rate from {From} to {To}", fromCurrency, toCurrency);
                return null;
            }
        }
    }
}