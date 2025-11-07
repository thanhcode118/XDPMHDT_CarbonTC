using Application.Common.Features.CreditInventories.Commands.CreateCreditInventory;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using SharedLibrary.Interfaces;
using MediatR;
using Microsoft.Extensions.Hosting;

namespace Infrastructure.BackgroundJobs.Consumer
{
    public class CreditInventoryConsumerHostedService : BackgroundService
    {
        private readonly IMessageConsumer _consumer;
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<CreditInventoryConsumerHostedService> _logger;

        public CreditInventoryConsumerHostedService(
            IMessageConsumer consumer,
            IServiceScopeFactory scopeFactory,
            ILogger<CreditInventoryConsumerHostedService> logger)
        {
            _consumer = consumer;
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            await _consumer.Subscribe<CreateCreditInventoryCommand>("credit_inventory_queue", async (message) =>
            {
                using var scope = _scopeFactory.CreateScope();
                var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();

                try
                {
                    var result = await mediator.Send(message, stoppingToken);
                    if (result.IsSuccess)
                        _logger.LogInformation($"CreditInventory created: {result.Value}");
                    else
                        _logger.LogWarning($"Failed: {result.Error}");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error handling message");
                }
            });
        }
    }
}
