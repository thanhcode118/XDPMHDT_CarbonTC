using Application.Common.Interfaces;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace Infrastructure.Services
{
    public class CurrentUserService : ICurrentUserService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CurrentUserService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        private ClaimsPrincipal User => _httpContextAccessor.HttpContext?.User;

        public Guid? UserId
        {
            get
            {
                var userIdStr = User?.FindFirst("userId")?.Value
                    ?? User?.FindFirst("sub")?.Value
                    ?? User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                return Guid.TryParse(userIdStr, out var userId) ? userId : null;
            }
        }

        public string Email => User?.FindFirst("email")?.Value
            ?? User?.FindFirst(ClaimTypes.Email)?.Value;

        public string Username => User?.FindFirst("username")?.Value
            ?? User?.FindFirst(ClaimTypes.Name)?.Value;

        public List<string> Roles
        {
            get
            {
                var roles = User?.FindAll("role")
                    .Select(c => c.Value)
                    .ToList();

                if (roles == null || !roles.Any())
                {
                    roles = User?.FindAll(ClaimTypes.Role)
                        .Select(c => c.Value)
                        .ToList();
                }

                return roles ?? new List<string>();
            }
        }

        public bool IsAuthenticated => User?.Identity?.IsAuthenticated ?? false;

        public bool IsInRole(string role)
        {
            return Roles.Contains(role, StringComparer.OrdinalIgnoreCase);
        }

        public bool HasAnyRole(params string[] roles)
        {
            return roles.Any(role => IsInRole(role));
        }

        public string GetClaimValue(string claimType)
        {
            return User?.FindFirst(claimType)?.Value;
        }
    }
}
