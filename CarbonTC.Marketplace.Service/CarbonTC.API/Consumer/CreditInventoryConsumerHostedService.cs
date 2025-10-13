
using Application.Common.Features.CreditInventories.Commands.CreateCreditInventory;
using MediatR;
using SharedLibrary.Interfaces;

namespace CarbonTC.API.Consumer
{
    public class CreditInventoryConsumerHostedService : BackgroundService
    {
        private readonly IMessageConsumer _consumer;
        private readonly IMediator _mediator;
        private readonly ILogger<CreditInventoryConsumerHostedService> _logger;

        public CreditInventoryConsumerHostedService(
            IMessageConsumer consumer, 
            IMediator mediator, 
            ILogger<CreditInventoryConsumerHostedService> logger)
        {
            _consumer = consumer;
            _mediator = mediator;
            _logger = logger;
        }
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            await _consumer.Subscribe<CreateCreditInventoryCommand>("credit_inventory_queue", async (message) =>
            {
                try
                {
                    var result = await _mediator.Send(message, stoppingToken);
                    if (result.IsSuccess)
                    {
                        _logger.LogInformation($"CreditInventory created: {result.Value}");
                    }
                    else
                    {
                        _logger.LogWarning($"Failed: {result.Error.ToString}");
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError($"Error handling message: {ex.Message}");
                }
            });
        }
    }
}
