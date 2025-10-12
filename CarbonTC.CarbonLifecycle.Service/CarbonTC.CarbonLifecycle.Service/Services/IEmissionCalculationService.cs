namespace CarbonTC.CarbonLifecycle.Service.Services
{
    public interface IEmissionCalculationService
    {
        /// <summary>
        /// Tính toán lượng CO2 tiết kiệm được dựa trên quãng đường.
        /// </summary>
        /// <param name="distanceKm">Quãng đường đi được (km).</param>
        /// <returns>Lượng CO2 tiết kiệm được (kg).</returns>
        Task<decimal> CalculateCO2Saved(decimal distanceKm);

        /// <summary>
        /// Tính toán số tín chỉ carbon có thể tạo ra từ lượng CO2 tiết kiệm.
        /// </summary>
        /// <param name="co2SavedKg">Lượng CO2 tiết kiệm được (kg).</param>
        /// <param name="standardId">ID của tiêu chuẩn CVA để lấy tỷ lệ chuyển đổi.</param>
        /// <returns>Số tín chỉ carbon ước tính.</returns>
        Task<decimal> CalculateCredits(decimal co2SavedKg, Guid standardId);
    }
}