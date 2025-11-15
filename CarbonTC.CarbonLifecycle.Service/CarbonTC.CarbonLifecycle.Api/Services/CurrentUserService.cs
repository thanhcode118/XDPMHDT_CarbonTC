using System.Security.Claims;
using CarbonTC.CarbonLifecycle.Application.Services;
using Microsoft.Extensions.Logging;

namespace CarbonTC.CarbonLifecycle.Api.Services
{
    public class CurrentUserService : IIdentityService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<CurrentUserService> _logger;

        public CurrentUserService(IHttpContextAccessor httpContextAccessor, ILogger<CurrentUserService> logger)
        {
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
        }

        public string? GetUserId()
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext == null)
            {
                _logger.LogWarning("HttpContext is null");
                return null;
            }

            var user = httpContext.User;
            if (user == null)
            {
                _logger.LogWarning("User is null");
                return null;
            }

            // Thử nhiều cách để lấy UserId
            var userId = user.FindFirstValue("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")
                       ?? user.FindFirstValue(ClaimTypes.NameIdentifier)
                       ?? user.FindFirstValue("sub")
                       ?? user.FindFirstValue("userId");

            if (string.IsNullOrEmpty(userId))
            {
                _logger.LogWarning("UserId not found in claims. Available claims: {Claims}", 
                    string.Join(", ", user.Claims.Select(c => $"{c.Type}={c.Value}")));
            }
            else
            {
                _logger.LogInformation("UserId found: {UserId}", userId);
            }

            return userId;
        }

        // Lấy role của người dùng
        public string? GetUserRole()
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext == null || httpContext.User == null)
            {
                return null;
            }

            // Thử nhiều cách để lấy role
            return httpContext.User.FindFirstValue(ClaimTypes.Role) ??
                   httpContext.User.FindFirstValue("role") ??
                   httpContext.User.FindFirstValue("http://schemas.microsoft.com/ws/2008/06/identity/claims/role");
        }

        // Kiểm tra người dùng có role cụ thể không
        public bool IsInRole(string role)
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext == null || httpContext.User == null)
            {
                return false;
            }

            return httpContext.User.IsInRole(role);
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