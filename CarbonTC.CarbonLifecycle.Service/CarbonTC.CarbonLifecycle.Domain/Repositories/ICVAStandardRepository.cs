using System;
using System.Collections.Generic;
using System.Threading.Tasks;
// File: CarbonTC.CarbonLifecycle.Domain/Repositories/ICVAStandardRepository.cs
// ... (using statements)
using CarbonTC.CarbonLifecycle.Domain.Entities; // Cần entity

public interface ICVAStandardRepository
{
    Task<CVAStandard?> GetByIdAsync(Guid id); // Thêm ?
    Task<IEnumerable<CVAStandard>> GetAllActiveStandardsAsync();
    Task<CVAStandard?> GetActiveStandardByVehicleTypeAsync(string vehicleType); // Thêm ?
    Task AddAsync(CVAStandard standard);
    Task UpdateAsync(CVAStandard standard); // Sửa thành Task
    Task DeleteAsync(Guid id);

    // --- BỔ SUNG ---
    /// <summary>
    /// Lấy tất cả các tiêu chuẩn, có thể lọc theo trạng thái active.
    /// </summary>
    /// <param name="isActive">null = lấy tất cả, true = chỉ active, false = chỉ inactive.</param>
    Task<IEnumerable<CVAStandard>> GetAllAsync(bool? isActive = null);
}