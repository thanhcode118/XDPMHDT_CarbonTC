using CarbonTC.CarbonLifecycle.Service.Data;
using CarbonTC.CarbonLifecycle.Service.Models.Entities;
using CarbonTC.CarbonLifecycle.Service.Models.Enums;
using Microsoft.EntityFrameworkCore;
using System; // Thêm using System để sử dụng Guid

namespace CarbonTC.CarbonLifecycle.Service.Repositories
{
    public class CarbonCreditRepository : GenericRepository<CarbonCredit>, ICarbonCreditRepository
    {
        public CarbonCreditRepository(AppDbContext context) : base(context)
        {
        }

        // Thay đổi string ownerId thành Guid ownerId
        public async Task<IEnumerable<CarbonCredit>> GetCreditsByOwnerIdAsync(Guid ownerId)
        {
            return await _dbSet.Where(cc => cc.OwnerId == ownerId).ToListAsync();
        }

        public async Task<IEnumerable<CarbonCredit>> GetCreditsByStatusAsync(CarbonCreditStatus status)
        {
            return await _dbSet.Where(cc => cc.Status == status).ToListAsync();
        }

        public async Task<CarbonCredit?> GetCreditBySerialNumberAsync(string serialNumber)
        {
            return await _dbSet.FirstOrDefaultAsync(cc => cc.CreditSerialNumber == serialNumber);
        }
    }
}