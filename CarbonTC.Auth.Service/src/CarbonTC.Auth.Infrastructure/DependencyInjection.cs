// CarbonTC.Auth.Infrastructure/DependencyInjection.cs
using CarbonTC.Auth.Application.Interfaces;
using CarbonTC.Auth.Infrastructure.MessageQueue;
using CarbonTC.Auth.Infrastructure.Persistence;
using CarbonTC.Auth.Infrastructure.Repositories;
using CarbonTC.Auth.Infrastructure.Security;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace CarbonTC.Auth.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // Database
        services.AddDbContext<AuthDbContext>(options =>
            options.UseMySql(
                configuration.GetConnectionString("DefaultConnection"),
                ServerVersion.AutoDetect(configuration.GetConnectionString("DefaultConnection"))
            )
        );

        // Repositories
        services.AddScoped<IUserRepository, UserRepository>();

        // Security
        services.AddScoped<IPasswordHasher, BcryptPasswordHasher>();
        services.AddScoped<ITokenService, JwtTokenService>();

        // RabbitMQ
        services.AddSingleton<IMessagePublisher, RabbitMqPublisher>();

        return services;
    }
}