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
            if (journey == null) throw new ArgumentNullException(nameof(journey));
            if (standard == null) throw new ArgumentNullException(nameof(standard));

            // Lấy khoảng cách từ Entity (decimal) và CHUYỂN ĐỔI sang Value Object
            var journeyDistance = Distance.FromKilometers((double)journey.DistanceKm);

            // Lấy yêu cầu khoảng cách tối thiểu từ Standard (decimal) và CHUYỂN ĐỔI sang Value Object để so sánh
            var minDistanceRequirement = Distance.FromKilometers((double)standard.MinDistanceRequirement);

            // Kiểm tra điều kiện sử dụng Value Objects
            if (journeyDistance.Value < minDistanceRequirement.Value) // So sánh giá trị đã chuẩn hóa
            {
                return CO2Amount.FromKg(0);
            }

            // Lấy ConversionRate từ CVAStandard (decimal)
            // Giả định ConversionRate là kg CO2e tiết kiệm được trên mỗi km EV di chuyển
            var savedCO2PerKm = (double)standard.ConversionRate;

            var co2ReductionKg = journeyDistance.ToKilometers().Value * savedCO2PerKm;

            // Cập nhật lại thuộc tính CO2EstimateKg của Entity EVJourney
            // (Lưu ý: Entity EVJourney KHÔNG CÓ setter riêng cho Value Object, nên chúng ta gán lại giá trị primitive)
            journey.CO2EstimateKg = (decimal)co2ReductionKg; // Gán lại giá trị decimal vào Entity

            return CO2Amount.FromKg(co2ReductionKg);
        }

        public async Task<(CO2Amount totalCO2, CreditAmount totalCredits)> CalculateBatchCarbonCreditsAsync(
            JourneyBatch batch, CVAStandard standard)
        {
            if (batch == null) throw new ArgumentNullException(nameof(batch));
            if (standard == null) throw new ArgumentNullException(nameof(standard));

            CO2Amount totalCO2Saved = CO2Amount.FromKg(0);
            foreach (var journey in batch.EVJourneys)
            {
                // Sử dụng CO2EstimateKg đã được tính và lưu trong EVJourney Entity
                totalCO2Saved = totalCO2Saved.Add(CO2Amount.FromKg((double)journey.CO2EstimateKg));
            }

            // Quy đổi thành tín chỉ carbon
            // Giả định standard.ConversionRate là hệ số quy đổi từ kg CO2e sang 1 tín chỉ
            if ((double)standard.ConversionRate <= 0)
            {
                throw new InvalidOperationException("CVA Standard must have a positive conversion rate for carbon credits.");
            }

            var totalCO2InKg = totalCO2Saved.ToKg().Value;
            var creditAmountValue = (int)Math.Floor(totalCO2InKg / (double)standard.ConversionRate);
            var totalCredits = CreditAmount.FromInt(creditAmountValue);

            // Cập nhật lại các trường primitive trong Entity JourneyBatch
            batch.TotalCO2SavedKg = (decimal)totalCO2Saved.ToKg().Value;
            batch.NumberOfJourneys = batch.EVJourneys.Count;
            batch.TotalDistanceKm = (decimal)batch.EVJourneys.Sum(j => (double)j.DistanceKm); // Tính lại tổng khoảng cách

            return (totalCO2Saved, totalCredits);
        }
    }
}