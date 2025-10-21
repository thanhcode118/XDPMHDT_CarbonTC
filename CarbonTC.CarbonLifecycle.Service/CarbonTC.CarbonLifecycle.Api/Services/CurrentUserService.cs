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
            // Cố gắng lấy ID người dùng từ claims (thường là 'sub' hoặc 'nameidentifier' từ JWT)
            var userId = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier)
                      ?? _httpContextAccessor.HttpContext?.User?.FindFirstValue("sub");

            // TODO: Xóa bỏ dòng code hardcoded này khi tích hợp xác thực thực sự
            // Đây chỉ là giải pháp tạm thời để các handler có thể hoạt động
            if (string.IsNullOrEmpty(userId))
            {
                return "test-user-123"; // ID người dùng hardcoded để test
            }

            return userId;
        }

        public string? GetUserEmail()
        {
            return _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Email)
                   ?? "test.user@example.com"; // Email hardcoded để test
        }
    }
}