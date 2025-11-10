using Application.Common.Features.Transactions.Commands;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using RabbitMQ.Client;
using SharedLibrary.Interfaces;

namespace Infrastructure.BackgroundJobs.Consumer
{
    public class TransactionFailedConsumerHostedService : BackgroundService
    {
        private readonly IMessageConsumer _consumer;
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<TransactionFailedConsumerHostedService> _logger;

        public TransactionFailedConsumerHostedService(
            IMessageConsumer consumer,
            IServiceScopeFactory scopeFactory,
            ILogger<TransactionFailedConsumerHostedService> logger)
        {
            _consumer = consumer;
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            await _consumer.Subscribe<TransactionCompletedCommand>(
                "transaction_exchange",
                ExchangeType.Topic,
                "transaction.failed",
                "transaction_failed_queue",
                async (message) =>            
                {
                    if (message == null)
                    {
                        _logger.LogError("Received a null message from the 'transaction_failed_queue'.");
                        return;
                    }

                    using var scope = _scopeFactory.CreateScope();
                    var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();

                    try
                    {
                        _logger.LogInformation($"Received FAILED notification for TransactionId: {message.TransactionId}. Reason: {message.Message}. Starting processing...");
                        var result = await mediator.Send(message, stoppingToken);

                        if (result.IsSuccess)
                        {
                            _logger.LogInformation($"Successfully processed (acknowledged) FAILED notification for TransactionId: {message.TransactionId}.");
                        }
                        else
                        {
                            _logger.LogWarning($"Failed to process (acknowledge) FAILED notification for TransactionId: {message.TransactionId}. Error: {result.Error}");
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, $"Critical system error while processing FAILED message for TransactionId: {message.TransactionId}");
                    }
                });
        }
    }
}
