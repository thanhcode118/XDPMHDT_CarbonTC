using CarbonTC.CarbonLifecycle.Api.Middlewares;
using CarbonTC.CarbonLifecycle.Api.Services;
using CarbonTC.CarbonLifecycle.Application.Services;

namespace CarbonTC.CarbonLifecycle.Api.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddApiLayer(this IServiceCollection services)
        {
            // Đăng ký dịch vụ để truy cập HttpContext
            services.AddHttpContextAccessor();

            // Đăng ký triển khai IIdentityService
            services.AddScoped<IIdentityService, CurrentUserService>();

            return services;
        }
    }
}