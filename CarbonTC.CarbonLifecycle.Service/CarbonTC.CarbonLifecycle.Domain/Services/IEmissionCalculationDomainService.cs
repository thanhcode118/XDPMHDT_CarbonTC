// interface cho dịch vụ tính toán lượng CO2 giảm phát thải và quy đổi thành tín chỉ carbon.

using System;
using System.Threading.Tasks;
using CarbonTC.CarbonLifecycle.Domain.Entities;
using CarbonTC.CarbonLifecycle.Domain.ValueObjects;

namespace CarbonTC.CarbonLifecycle.Domain.Services
{
    public interface IEmissionCalculationDomainService
    {
        // Tính toán lượng CO2 giảm phát thải cho một EVJourney cụ thể
        // Cần CVAStandard để biết hệ số chuyển đổi
        Task<CO2Amount> CalculateCO2ReductionAsync(EVJourney journey, CVAStandard standard);

        // Tính toán tổng CO2 giảm và số lượng tín chỉ carbon cho một JourneyBatch
        Task<(CO2Amount totalCO2, CreditAmount totalCredits)> CalculateBatchCarbonCreditsAsync(
            JourneyBatch batch, CVAStandard standard);
    }
}