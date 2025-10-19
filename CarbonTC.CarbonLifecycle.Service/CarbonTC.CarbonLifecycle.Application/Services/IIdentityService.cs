//Service này dùng để lấy thông tin người dùng đang đăng nhập
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarbonTC.CarbonLifecycle.Application.Services
{
    public interface IIdentityService
    {
        // Lấy ID của người dùng đang đăng nhập
        string? GetUserId();

        // Lấy email (hoặc username) của người dùng
        string? GetUserEmail();
    }
}
