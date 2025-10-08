using Application.Common.Interfaces;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Services
{
    public class IntegrationEventService : IIntegrationEventService
    {
        private readonly ILogger<IntegrationEventService> _logger;

        public IntegrationEventService(ILogger<IntegrationEventService> logger)
        {
            _logger = logger;
        }
        public async Task PublishAsync<T>(T integrationEvent, CancellationToken cancellationToken = default) where T : class
        {
            // Trong thực tế, bạn có thể sử dụng:
            // - Service Bus (Azure Service Bus, RabbitMQ, etc.)
            // - Event Grid
            // - Kafka
            // - SignalR cho real-time notifications

            _logger.LogInformation("Publishing integration event: {EventType} - {Event}",
                typeof(T).Name,
                System.Text.Json.JsonSerializer.Serialize(integrationEvent));

            // Simulate external service call
            await Task.Delay(100, cancellationToken);

            // Example: Send to message queue, webhook, etc.
            // await _serviceBusClient.SendAsync(integrationEvent);
        }
    }
}
