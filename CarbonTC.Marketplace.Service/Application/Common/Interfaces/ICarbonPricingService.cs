namespace Application.Common.Interfaces
{
    public interface ICarbonPricingService
    {
        Task<float> PredictPrice(string creditType, string verificationStandard, float vintage,
            float quantity, float marketSupply, float marketDemand);
    }
}
