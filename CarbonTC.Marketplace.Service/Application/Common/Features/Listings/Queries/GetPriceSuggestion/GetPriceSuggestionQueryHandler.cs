using Application.Common.Interfaces;
using Domain.Common.Response;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Application.Common.Features.Listings.Queries.GetPriceSuggestion
{
    public class GetPriceSuggestionQueryHandler : IRequestHandler<GetPriceSuggestionQuery, Result<float>>
    {
        private readonly ICarbonPricingService _carbonPricing;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICarbonLifecycleServiceClient _carbonLifecycleService;
        private readonly ICacheService _cacheService;
        private readonly ILogger<GetPriceSuggestionQueryHandler> _logger;
        private readonly IFXRatesServiceClient _fXRates;

        public GetPriceSuggestionQueryHandler(
            ICarbonPricingService carbonPricing, 
            IUnitOfWork unitOfWork, 
            ICarbonLifecycleServiceClient carbonLifecycleService, 
            ICacheService cacheService, 
            ILogger<GetPriceSuggestionQueryHandler> logger,
            IFXRatesServiceClient fXRates)
        {
            _carbonPricing = carbonPricing;
            _unitOfWork = unitOfWork;
            _carbonLifecycleService = carbonLifecycleService;
            _cacheService = cacheService;
            _logger = logger;
            _fXRates = fXRates;
        }

        public async Task<Result<float>> Handle(GetPriceSuggestionQuery request, CancellationToken cancellationToken)
        {
            var creditToSell = await _unitOfWork.CreditInventories.GetByCreditIdAsync(request.CreditId);
            if (creditToSell == null)
            {
                return Result.Failure<float>(new Error("NotFound", "Credit inventory not found."));
            }

            var quantity = creditToSell.AvailableAmount;

            var cvaStandards = await _carbonLifecycleService.GetCVAStandardsAsync(request.CreditId, cancellationToken);

            var creditType = "RenewableEnergy";
            var verificationStandard = cvaStandards.StandardName;
            var vintage = cvaStandards.EffectiveDate.Year;

            // Fetch market supply and demand from cache
            var supplyKey = $"market:supply:{creditType}";
            var demandKey = $"market:demand:{creditType}";

            var marketSupply = await _cacheService.GetStringAsync<float>(supplyKey);
            var marketDemand = await _cacheService.GetStringAsync<float>(demandKey);
            if (marketSupply == 0 || marketDemand == 0)
            {
                _logger.LogWarning("Cache miss for market data. Recalculating...");

                var supplyTask = _unitOfWork.CreditInventories.GetTotalSupplyByTypeAsync(cancellationToken);
                var demandTask = _unitOfWork.Listings.GetTotalDemandByTypeAsync(cancellationToken);

                await Task.WhenAll(supplyTask, demandTask);

                marketSupply = (float)supplyTask.Result;
                marketDemand = (float)demandTask.Result;

                var ttl = TimeSpan.FromMinutes(10);
                await _cacheService.SetStringAsync(supplyKey, marketSupply, ttl);
                await _cacheService.SetStringAsync(demandKey, marketDemand, ttl);
            }

            var predictedPrice = await _carbonPricing.PredictPrice(
                creditType,
                verificationStandard,
                vintage,
                (float)quantity,
                (float)marketSupply,
                (float)marketDemand
            );

            var fxResult = await _fXRates.GetRateAsync("usd", "vnd", cancellationToken);

            return Result<float>.Success((float)fxResult * predictedPrice);
        }
    }
}
