// triển khai của IEmissionCalculationDomainService. Nó sẽ sử dụng các Value Objects và Entity CVAStandard để thực hiện tính toán.
using System;
using System.Linq;
using System.Threading.Tasks;
using CarbonTC.CarbonLifecycle.Domain.Entities;
using CarbonTC.CarbonLifecycle.Domain.ValueObjects;
using CarbonTC.CarbonLifecycle.Domain.Repositories;

namespace CarbonTC.CarbonLifecycle.Domain.Services
{
    public class EmissionCalculationDomainService : IEmissionCalculationDomainService
    {
        private readonly ICVAStandardRepository _cvaStandardRepository;

        public EmissionCalculationDomainService(ICVAStandardRepository cvaStandardRepository)
        {
            _cvaStandardRepository = cvaStandardRepository;
        }

        public async Task<CO2Amount> CalculateCO2ReductionAsync(EVJourney journey, CVAStandard standard)
        {
            // [Fix CS0272 cho EVJourney.CO2EstimateKg]

            if (journey == null) throw new ArgumentNullException(nameof(journey));
            if (standard == null) throw new ArgumentNullException(nameof(standard));

            // Lấy khoảng cách từ Entity (decimal) và CHUYỂN ĐỔI sang Value Object
            var journeyDistance = Distance.FromKilometers((double)journey.DistanceKm);

            // Lấy yêu cầu khoảng cách tối thiểu từ Standard (decimal) và CHUYỂN ĐỔI sang Value Object để so sánh
            var minDistanceRequirement = Distance.FromKilometers((double)standard.MinDistanceRequirement);

            // Kiểm tra điều kiện sử dụng Value Objects
            if (journeyDistance.Value < minDistanceRequirement.Value) // So sánh giá trị đã chuẩn hóa
            {
                // Cập nhật Entity EVJourney với CO2 Estimate = 0 - SỬ DỤNG BEHAVIOR METHOD
                journey.UpdateCO2Estimate(0m);
                return CO2Amount.FromKg(0);
            }

            // Lấy ConversionRate từ CVAStandard (decimal)
            var savedCO2PerKm = (double)standard.ConversionRate;

            var co2ReductionKg = journeyDistance.ToKilometers().Value * savedCO2PerKm;

            // Cập nhật lại thuộc tính CO2EstimateKg của Entity EVJourney - SỬ DỤNG BEHAVIOR METHOD
            journey.UpdateCO2Estimate((decimal)co2ReductionKg);

            return CO2Amount.FromKg(co2ReductionKg);
        }

        public async Task<(CO2Amount totalCO2, CreditAmount totalCredits)> CalculateBatchCarbonCreditsAsync(
            JourneyBatch batch, CVAStandard standard)
        {
            // [Fix CS0272 cho JourneyBatch.TotalCO2SavedKg, NumberOfJourneys, TotalDistanceKm]

            if (batch == null) throw new ArgumentNullException(nameof(batch));
            if (standard == null) throw new ArgumentNullException(nameof(standard));

            // Tính tổng CO2 đã tiết kiệm
            CO2Amount totalCO2Saved = CO2Amount.FromKg(0);
            foreach (var journey in batch.EVJourneys)
            {
                totalCO2Saved = totalCO2Saved.Add(CO2Amount.FromKg((double)journey.CO2EstimateKg));
            }

            // Quy đổi thành tín chỉ carbon: Giả định 1 Credit = 1 kg CO2e đã tiết kiệm
            var totalCO2InKg = totalCO2Saved.ToKg().Value;
            var creditAmountValue = (int)Math.Floor(totalCO2InKg);
            var totalCredits = CreditAmount.FromInt(creditAmountValue);


            return (totalCO2Saved, totalCredits);
        }
    }
}