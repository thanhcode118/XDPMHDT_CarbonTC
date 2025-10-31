using Application.Common.DTOs;
using Application.Common.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using SharedLibrary.Model;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;

namespace Infrastructure.Services
{
    public class WalletServiceClient : IWalletServiceClient
    {
        private readonly HttpClient _httpClient;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<WalletServiceClient> _logger;

        public WalletServiceClient(HttpClient httpClient, IHttpContextAccessor httpContextAccessor, ILogger<WalletServiceClient> logger)
        {
            _httpClient = httpClient;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
        }

        public async Task<bool> HasSufficientBalanceAsync(Guid userId, decimal amount, CancellationToken cancellationToken = default)
        {
            try
            {
                var response = await _httpClient.GetAsync($"api/wallet/check-balance?userId={userId}&amount={amount}", cancellationToken);
                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking balance for user {UserId}", userId);
                return false;
            }
        }

        public async Task<bool> CommitPaymentAsync(Guid userId, decimal amount, CancellationToken cancellationToken = default)
        {
            try
            {
                var response = await _httpClient.PostAsJsonAsync("/api/wallet/commit", new { userId, amount }, cancellationToken);
                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error committing payment for user {UserId}", userId);
                return false;
            }
        }

        public async Task<bool> ReserveFundsAsync(Guid userId, decimal amount, CancellationToken cancellationToken = default)
        {
            try
            {
                var response = await _httpClient.PostAsJsonAsync("/api/wallet/reserve", new { userId, amount }, cancellationToken);
                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reserving funds for user {UserId}", userId);
                return false;
            }
        }

        public async Task<bool> RollbackReservationAsync(Guid userId, decimal amount, CancellationToken cancellationToken = default)
        {
            try
            {
                var response = await _httpClient.PostAsJsonAsync("/api/wallet/rollback", new { userId, amount }, cancellationToken);
                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error rolling back funds for user {UserId}", userId);
                return false;
            }
        }

        public async Task<WalletDto?> GetBalanceAsync(CancellationToken cancellationToken = default)
        {
            /*try
            {
                var authHeader = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"].ToString();

                if (!string.IsNullOrEmpty(authHeader))
                {
                    _httpClient.DefaultRequestHeaders.Authorization =
                        new AuthenticationHeaderValue("Bearer", authHeader.Replace("Bearer ", ""));
                }
                else
                {
                    _logger.LogWarning("Missing Authorization header when calling wallet service");
                    return null;
                }

                using var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
                cts.CancelAfter(TimeSpan.FromSeconds(3));

                var response = await _httpClient.GetAsync("/api/wallet/my-wallet", cts.Token);

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning(
                        "Wallet service returned {StatusCode}",
                        response.StatusCode);
                    return null;
                }

                var contentStream = await response.Content.ReadAsStreamAsync(cts.Token);
                var walletResponse = await JsonSerializer.DeserializeAsync<WalletResponseDto<WalletDto>>(
                    contentStream,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true },
                    cts.Token
                );

                if (walletResponse?.Success != true || walletResponse.Data == null)
                {
                    _logger.LogWarning("Invalid wallet API response");
                    return null;
                }

                var wallet = walletResponse.Data;

                if (wallet.Balance < 0)
                {
                    _logger.LogWarning("Invalid wallet balance");
                    return null;
                }

                return wallet;
            }
            catch (OperationCanceledException)
            {
                _logger.LogWarning("Wallet service timeout");
                return null;
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "HTTP error fetching wallet balance");
                return null;
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "JSON error deserializing wallet response");
                return null;
            }
        */
            return new WalletDto
            {
                WalletId = 12345,
                UserId = "d5190e3a-e1bd-4e82-8571-38097c3a9652",
                Balance = 20000000.00m,
                Currency = "VND",
                UpdatedAt = DateTime.UtcNow
            };
        }
    }
}