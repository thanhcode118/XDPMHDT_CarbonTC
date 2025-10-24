using Application.Common.Interfaces;
using Domain.Repositories;
using Infrastructure.Data.Repositories;
using Infrastructure.Redis;
using Infrastructure.Services;
using Infrastructure.SignalR.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using StackExchange.Redis;

namespace Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddDbContext<ApplicationDbContext>(options =>
               options.UseMySql(
                   configuration.GetConnectionString("DefaultConnection"),
                   new MySqlServerVersion(new Version(8, 0, 21)),
                   b => b.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName)));

            services.AddSingleton<IConnectionMultiplexer>(sp =>
            {
                var config = ConfigurationOptions.Parse(configuration.GetConnectionString("Redis"), true);
                return ConnectionMultiplexer.Connect(config);
            });

            services.AddTransient<IDatabase>(sp =>
            {
                var multiplexer = sp.GetRequiredService<IConnectionMultiplexer>();
                return multiplexer.GetDatabase();
            });


            services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<ApplicationDbContext>());

            services.AddHttpClient<IWalletServiceClient, WalletServiceClient>(client =>
            {
                client.BaseAddress = new Uri(configuration["Services:WalletService"]);
                client.DefaultRequestHeaders.Add("Accept", "application/json");
            });
            services.AddHttpClient<ICarbonLifecycleServiceClient, CarbonLifecycleServiceClient>(client =>
            {
                client.BaseAddress = new Uri(configuration["Services:CarbonLifecycleService"]);
                client.DefaultRequestHeaders.Add("Accept", "application/json");
            });


            // Repositories
            services.AddScoped<IAuctionBidRepository, AuctionBidRepository>();
            services.AddScoped<IListingRepository, ListingRepository>();
            services.AddScoped<IPriceSuggestionRepository, PriceSuggestionRepository>();
            services.AddScoped<ICreditInventoryRepository, CreditInventoryRepository>();
            services.AddScoped<ITransactionsRepository, TransactionsRepository>();

            // unit of work
            services.AddScoped<IUnitOfWork, UnitOfWork>();

            // Other services
            services.AddScoped<IDomainEventService, DomainEventService>();
            services.AddScoped<IIntegrationEventService, IntegrationEventService>();
            services.AddScoped<ICurrentUserService, CurrentUserService>();
            services.AddScoped<INotificationService, SignalRNotificationService>();
            services.AddScoped<ICacheService, RedisCacheService>();
            services.AddScoped<IBalanceService, RedisBalanceService>();
            services.AddScoped<ICarbonPricingService, CarbonPricingService>();
            return services;
        }
    }
}
