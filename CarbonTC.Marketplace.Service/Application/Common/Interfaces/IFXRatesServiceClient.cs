namespace Application.Common.Interfaces
{
    public interface IFXRatesServiceClient
    {
        
        Task<decimal?> GetRateAsync(
            string? fromCurrency = "usd",
            string? toCurrency = "vnd",
            CancellationToken cancellationToken = default);
    }
}