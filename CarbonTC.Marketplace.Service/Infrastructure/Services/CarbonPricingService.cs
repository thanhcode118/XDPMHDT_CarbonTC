using Application.Common.Interfaces;

namespace Infrastructure.Services
{
    public class CarbonPricingService : ICarbonPricingService
    {
        public Task<float> PredictPrice(string creditType, string verificationStandard, float vintage, float quantity, float marketSupply, float marketDemand)
        {
            var modelInput = new CarbonSuggestedPrice.ModelInput()
            {
                CreditType = creditType,
                VerificationStandard = verificationStandard,
                Vintage = vintage,
                Quantity = quantity,
                MarketSupply_SameType = marketSupply,
                MarketDemand_RecentVolume = marketDemand
            };

            var predictionResult = CarbonSuggestedPrice.Predict(modelInput);

            return Task.FromResult(predictionResult.Score);
        }
    }
}
