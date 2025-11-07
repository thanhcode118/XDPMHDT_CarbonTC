using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarbonTC.CarbonLifecycle.Domain.Repositories
{
    // Interface này quản lý việc commit các thay đổi vào CSDL
    public interface IUnitOfWork
    {
        // Lưu tất cả các thay đổi vào cơ sở dữ liệu
        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
