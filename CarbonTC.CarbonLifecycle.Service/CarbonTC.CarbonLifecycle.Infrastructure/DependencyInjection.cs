using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using CarbonTC.CarbonLifecycle.Application.Abstractions.Messaging;
using CarbonTC.CarbonLifecycle.Application.Abstractions.Storage;
using CarbonTC.CarbonLifecycle.Domain.Repositories;
using CarbonTC.CarbonLifecycle.Infrastructure.Configuration;
using CarbonTC.CarbonLifecycle.Infrastructure.MessageBroker;
using CarbonTC.CarbonLifecycle.Infrastructure.Persistence;
using CarbonTC.CarbonLifecycle.Infrastructure.Persistence.Repositories;
using CarbonTC.CarbonLifecycle.Infrastructure.Services.FileStorage;
using Microsoft.Extensions.Options;
using CarbonTC.CarbonLifecycle.Domain.Abstractions;

namespace CarbonTC.CarbonLifecycle.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(
            this IServiceCollection services,
            IConfiguration configuration)
        {
            // Configure Settings
            services.Configure<RabbitMQSettings>(configuration.GetSection("RabbitMQ"));
            services.Configure<FileStorageSettings>(configuration.GetSection("FileStorage"));

            // Database Configuration 
            services.AddDbContext<AppDbContext>(options =>
            {
                var connectionString = configuration.GetConnectionString("DefaultConnection");
                options.UseMySql(
                    connectionString,
                    ServerVersion.AutoDetect(connectionString),
                    mySqlOptions =>
                    {
                        mySqlOptions.EnableRetryOnFailure(
                            maxRetryCount: 5,
                            maxRetryDelay: TimeSpan.FromSeconds(10),
                            errorNumbersToAdd: null);
                    });
            });

            // Repositories
            services.AddScoped<IEVJourneyRepository, EVJourneyRepository>();
            services.AddScoped<IJourneyBatchRepository, JourneyBatchRepository>();
            services.AddScoped<ICVAStandardRepository, CVAStandardRepository>();
            services.AddScoped<IVerificationRequestRepository, VerificationRequestRepository>();
            services.AddScoped<ICarbonCreditRepository, CarbonCreditRepository>();
            services.AddScoped<IAuditReportRepository, AuditReportRepository>();
            services.AddScoped<IUnitOfWork, UnitOfWork>(); // Đăng ký UnitOfWork

            // Message Broker
            var rabbitMQSettings = configuration.GetSection("RabbitMQ").Get<RabbitMQSettings>();
            if (rabbitMQSettings?.EnablePublishing == true)
            {
                services.AddSingleton<IMessagePublisher, RabbitMQPublisher>();
            }
            else
            {
                services.AddSingleton<IMessagePublisher, NoOpMessagePublisher>();
            }

            // File Storage
            services.AddScoped<IFileStorageService, LocalFileStorageService>();

            // Domain Event Dispatcher
            services.AddScoped<IDomainEventDispatcher, // <-- Interface từ Domain.Abstractions
                              CarbonTC.CarbonLifecycle.Infrastructure.Services.Events.DomainEventDispatcher>();

            return services;
        }
    }

    /// <summary>
    /// No-operation message publisher for when RabbitMQ is disabled
    /// </summary>
    internal class NoOpMessagePublisher : IMessagePublisher
    {
        public Task PublishAsync<TEvent>(TEvent @event, string? routingKey = null)
            where TEvent : CarbonTC.CarbonLifecycle.Domain.Events.IDomainEvent
        {
            return Task.CompletedTask;
        }
        public Task PublishIntegrationEventAsync<TEvent>(TEvent @event, string? routingKey = null)
            where TEvent : class
        {
            return Task.CompletedTask;
        }

        public Task PublishBatchAsync<TEvent>(IEnumerable<TEvent> events, string? routingKey = null)
            where TEvent : CarbonTC.CarbonLifecycle.Domain.Events.IDomainEvent
        {
            return Task.CompletedTask;
        }
    }
}