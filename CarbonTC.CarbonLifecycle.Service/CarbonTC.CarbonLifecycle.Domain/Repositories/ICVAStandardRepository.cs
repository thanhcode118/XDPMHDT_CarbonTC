using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CarbonTC.CarbonLifecycle.Domain.Entities;

public interface ICVAStandardRepository
{
    Task<CVAStandard?> GetByIdAsync(Guid id);
    Task<IEnumerable<CVAStandard>> GetAllActiveStandardsAsync();
    Task<CVAStandard?> GetActiveStandardByVehicleTypeAsync(string vehicleType);
    Task AddAsync(CVAStandard standard);
    Task UpdateAsync(CVAStandard standard);
    Task DeleteAsync(Guid id);

    // --- BỔ SUNG ---
    /// <summary>
    /// Lấy tất cả các tiêu chuẩn, có thể lọc theo trạng thái active.
    /// </summary>
    /// <param name="isActive">null = lấy tất cả, true = chỉ active, false = chỉ inactive.</param>
    Task<IEnumerable<CVAStandard>> GetAllAsync(bool? isActive = null);
}