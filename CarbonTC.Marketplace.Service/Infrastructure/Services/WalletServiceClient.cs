using Application.Common.DTOs;
using Application.Common.Interfaces;
using Microsoft.Extensions.Logging;
using System.Net.Http.Json;
using System.Text.Json;

namespace Infrastructure.Services
{
    public class WalletServiceClient : IWalletServiceClient
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<WalletServiceClient> _logger;

        public WalletServiceClient(HttpClient httpClient, ILogger<WalletServiceClient> logger)
        {
            _httpClient = httpClient;
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

        public async Task<WalletDto?> GetBanlanceAsync(Guid UserId, CancellationToken cancellationToken = default)
        {
            try
            {
                var response = await _httpClient.GetAsync($"/api/wallet/balance?userId={UserId}", cancellationToken);

                response.EnsureSuccessStatusCode();

                var contentStream = await response.Content.ReadAsStreamAsync(cancellationToken);

                return await JsonSerializer.DeserializeAsync<WalletDto>(contentStream, cancellationToken: cancellationToken);
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error fetching balance for user {UserId}", UserId);
                throw;
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "Error deserializing balance for user {UserId}", UserId);
                throw;
            }
        }
    }
}