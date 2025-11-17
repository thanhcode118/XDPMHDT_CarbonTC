// CarbonTC.Auth.Infrastructure/DependencyInjection.cs

using CarbonTC.Auth.Application.Interfaces;
using CarbonTC.Auth.Infrastructure.MessageQueue;
using CarbonTC.Auth.Infrastructure.Persistence;
using CarbonTC.Auth.Infrastructure.Repositories;
using CarbonTC.Auth.Infrastructure.Security;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace CarbonTC.Auth.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // =============================
        // Database
        // =============================
        services.AddDbContext<AuthDbContext>(options =>
            options.UseMySql(
                configuration.GetConnectionString("DefaultConnection"),
                ServerVersion.AutoDetect(configuration.GetConnectionString("DefaultConnection")),
                mySqlOptions => mySqlOptions.EnableRetryOnFailure(
                    maxRetryCount: 3,
                    maxRetryDelay: TimeSpan.FromSeconds(5),
                    errorNumbersToAdd: null
                )
            )
        );

        // =============================
        // Repositories
        // =============================
        services.AddScoped<IUserRepository, UserRepository>();

        // =============================
        // Security Services
        // =============================
        services.AddScoped<IPasswordHasher, BcryptPasswordHasher>();
        services.AddScoped<ITokenService, JwtTokenService>();

        // =============================
        // RabbitMQ Message Publisher
        // =============================
        // ✅ Đăng ký như Singleton để tái sử dụng connection
        services.AddSingleton<IMessagePublisher>(sp =>
        {
            var logger = sp.GetService<ILogger<RabbitMqPublisher>>();
            return new RabbitMqPublisher(configuration, logger);
        });

        return services;
    }
}