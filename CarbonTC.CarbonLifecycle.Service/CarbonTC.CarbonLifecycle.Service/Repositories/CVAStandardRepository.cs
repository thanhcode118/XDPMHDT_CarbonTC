using CarbonTC.CarbonLifecycle.Service.Data;
using CarbonTC.CarbonLifecycle.Service.Models.Entities;
using Microsoft.EntityFrameworkCore;
using System; // Thêm using System để sử dụng Guid (nếu cần cho GetByIdAsync từ IGenericRepository)

namespace CarbonTC.CarbonLifecycle.Service.Repositories
{
    public class CVAStandardRepository : GenericRepository<CVAStandard>, ICVAStandardRepository
    {
        public CVAStandardRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<CVAStandard?> GetStandardByNameAsync(string name)
        {
            return await _dbSet.FirstOrDefaultAsync(cs => cs.StandardName == name);
        }

        public async Task<CVAStandard?> GetActiveStandardAsync()
        {
            // Giả định có một cách để xác định tiêu chuẩn "active" (ví dụ: cờ IsActive, hoặc tiêu chuẩn mới nhất)
            // Hiện tại, tôi sẽ lấy tiêu chuẩn đầu tiên hoặc mới nhất (tùy thuộc vào cách sắp xếp)
            return await _dbSet.OrderByDescending(cs => cs.CreatedAt).FirstOrDefaultAsync();
        }
    }
}