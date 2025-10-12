using CarbonTC.CarbonLifecycle.Service.Repositories; // Giả sử bạn có repository cho CVAStandard

namespace CarbonTC.CarbonLifecycle.Service.Services
{
    public class EmissionCalculationService : IEmissionCalculationService
    {
        private readonly ICVAStandardRepository _cvaStandardRepository;

        // Giả định một hệ số phát thải trung bình cho xe xăng (kg CO2/km)
        private const decimal GasolineCarEmissionFactor = 0.12m;

        public EmissionCalculationService(ICVAStandardRepository cvaStandardRepository)
        {
            _cvaStandardRepository = cvaStandardRepository;
        }

        public Task<decimal> CalculateCO2Saved(decimal distanceKm)
        {
            // Công thức đơn giản: Lượng CO2 tiết kiệm = Quãng đường * Hệ số phát thải xe xăng
            var co2Saved = distanceKm * GasolineCarEmissionFactor;
            return Task.FromResult(co2Saved);
        }

        public async Task<decimal> CalculateCredits(decimal co2SavedKg, Guid standardId)
        {
            var standard = await _cvaStandardRepository.GetByIdAsync(standardId);
            if (standard == null || standard.ConversionRate <= 0)
            {
                // Trả về 0 nếu không tìm thấy tiêu chuẩn hoặc tỷ lệ không hợp lệ
                return 0;
            }

            // Số tín chỉ = Lượng CO2 tiết kiệm / Tỷ lệ chuyển đổi của tiêu chuẩn
            var credits = co2SavedKg / standard.ConversionRate;
            return credits;
        }
    }
}