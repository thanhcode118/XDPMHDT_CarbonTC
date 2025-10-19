using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CarbonTC.CarbonLifecycle.Domain.Entities; 

namespace CarbonTC.CarbonLifecycle.Domain.Repositories
{
    public interface ICVAStandardRepository
    {
        Task<CVAStandard> GetByIdAsync(Guid id);
        Task<IEnumerable<CVAStandard>> GetAllActiveStandardsAsync();
        Task<CVAStandard> GetActiveStandardByVehicleTypeAsync(string vehicleType); // Thêm phương thức này để tìm kiếm tiêu chuẩn phù hợp
        Task AddAsync(CVAStandard standard);
        Task UpdateAsync(CVAStandard standard);
        Task DeleteAsync(Guid id);
    }
}