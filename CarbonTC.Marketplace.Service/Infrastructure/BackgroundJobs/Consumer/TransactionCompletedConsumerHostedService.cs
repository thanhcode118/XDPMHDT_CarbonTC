using Application.Common.Features.Transactions.Commands;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using RabbitMQ.Client;
using SharedLibrary.Interfaces;

namespace Infrastructure.BackgroundJobs.Consumer
{
    public class TransactionCompletedConsumerHostedService : BackgroundService
    {
        private readonly IMessageConsumer _consumer;
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<TransactionCompletedConsumerHostedService> _logger;

        public TransactionCompletedConsumerHostedService(IMessageConsumer consumer, IServiceScopeFactory scopeFactory, ILogger<TransactionCompletedConsumerHostedService> logger)
        {
            _consumer = consumer;
            _scopeFactory = scopeFactory;
            _logger = logger;
        }
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            await _consumer.Subscribe<TransactionCompletedCommand>(
                "transaction_exchange", 
                ExchangeType.Direct, 
                "transaction.completed", 
                "transaction_completed_queue", 
                async (message) =>
                {
                    using var scope = _scopeFactory.CreateScope();
                    var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();

                    try
                    {
                        var result = await mediator.Send(message, stoppingToken);
                        if (result.IsSuccess)
                            _logger.LogInformation("Transaction status updated successfully for Transaction ID: {TransactionId}", message.TransactionId);
                        else
                            _logger.LogWarning("Failed to update transaction status for Transaction ID: {TransactionId}", message.TransactionId);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error handling transaction completed message for Transaction ID: {TransactionId}", message.TransactionId);
                    }
                }); 
        }
    }
}
