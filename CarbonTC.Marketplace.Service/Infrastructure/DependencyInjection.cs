using Application.Common.Interfaces;
using Domain.Repositories;
using Infrastructure.Data.Repositories;
using Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

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

            services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<ApplicationDbContext>());

            services.AddHttpClient<IWalletServiceClient, WalletServiceClient>(client =>
            {
                client.BaseAddress = new Uri(configuration["Services:WalletService"]);
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
            return services;
        }
    }
}
