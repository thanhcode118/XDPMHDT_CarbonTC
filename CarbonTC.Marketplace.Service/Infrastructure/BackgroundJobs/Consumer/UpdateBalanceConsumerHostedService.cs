using Application.Common.Features.Listings.Commands.UpdateBalance;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using RabbitMQ.Client;
using SharedLibrary.Interfaces;

namespace Infrastructure.BackgroundJobs.Consumer
{
    public class UpdateBalanceConsumerHostedService : BackgroundService
    {
        private readonly IMessageConsumer _consumer;
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<UpdateBalanceConsumerHostedService> _logger;

        public UpdateBalanceConsumerHostedService(IMessageConsumer consumer, IServiceScopeFactory scopeFactory, ILogger<UpdateBalanceConsumerHostedService> logger)
        {
            _consumer = consumer;
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            await _consumer.Subscribe<UpdateBalanceCommand>(
                "balance_exchange",
                ExchangeType.Topic,
                "balance.update.command",
                "balance.update.command.queue",
                async (message) =>
                {
                    using var scope = _scopeFactory.CreateScope();
                    var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();
                    var logger = scope.ServiceProvider.GetRequiredService<ILogger<UpdateBalanceConsumerHostedService>>();

                    try
                    {
                        var result = await mediator.Send(message, stoppingToken);

                        if (result.IsSuccess)
                        {
                            logger.LogInformation("Successfully processed UpdateBalanceCommand for User: {UserId}", message.UserId);
                        }
                        else
                        {
                            logger.LogWarning("Business failure processing UpdateBalanceCommand for User: {UserId}. Error: {Error}", message.UserId, result.Error); 
                        }
                    }
                    catch (Exception ex)
                    {
                        logger.LogError(ex, "Infrastructure failure processing UpdateBalanceCommand for User: {UserId}. Message will be NACKed.", message.UserId);
                        throw;
                    }
                });
        }
    }
}