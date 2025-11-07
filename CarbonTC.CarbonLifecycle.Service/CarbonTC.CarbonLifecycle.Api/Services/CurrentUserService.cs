using System.Security.Claims;
using CarbonTC.CarbonLifecycle.Application.Services;

namespace CarbonTC.CarbonLifecycle.Api.Services
{
    public class CurrentUserService : IIdentityService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CurrentUserService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public string? GetUserId()
        {
            return _httpContextAccessor.HttpContext?.User?.FindFirstValue("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier");
        }

        // SỬA TÊN PHƯƠNG THỨC: GetUserEmail -> GetUserRole
        public string? GetUserRole()
        {
            return _httpContextAccessor.HttpContext?.User?.FindFirstValue("http://schemas.microsoft.com/ws/2008/06/identity/claims/role");
        }

        // BỔ SUNG (nếu bạn cần):
        public string? GetUserEmail()
        {
            // Claim cho email thường là "email" hoặc ClaimTypes.Email
            return _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Email) ??
                   _httpContextAccessor.HttpContext?.User?.FindFirstValue("email");
        }
    }
}