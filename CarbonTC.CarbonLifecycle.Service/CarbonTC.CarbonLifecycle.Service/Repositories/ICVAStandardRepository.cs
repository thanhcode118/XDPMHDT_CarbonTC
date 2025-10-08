using CarbonTC.CarbonLifecycle.Service.Models.Entities;
using System; // Thêm using System để sử dụng Guid (nếu cần cho GetByIdAsync từ IGenericRepository)

namespace CarbonTC.CarbonLifecycle.Service.Repositories
{
    public interface ICVAStandardRepository : IGenericRepository<CVAStandard>
    {
        // Thêm các phương thức đặc thù cho CVAStandard nếu có.
        Task<CVAStandard?> GetStandardByNameAsync(string name);
        Task<CVAStandard?> GetActiveStandardAsync(); // Ví dụ: lấy tiêu chuẩn đang áp dụng
    }
}