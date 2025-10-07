using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using SharedLibrary.Configuration;
using SharedLibrary.Interfaces;
using System.Text;
using System.Text.Json;

namespace SharedLibrary.Services
{
    public class RabbitMQConsumer : IMessageConsumer, IAsyncDisposable
    {

        private readonly RabbitMQSettings _settings;
        private readonly ILogger<RabbitMQConsumer> _logger;
        private IConnection? _connection;
        private IChannel? _channel;

        public RabbitMQConsumer (IOptions<RabbitMQSettings> settings, ILogger<RabbitMQConsumer> logger)
        {
            _settings = settings.Value;
            _logger = logger;
        }

        public static async Task<RabbitMQConsumer> CreateAsync(IOptions<RabbitMQSettings> options, ILogger<RabbitMQConsumer> logger)
        {
            var consumer = new RabbitMQConsumer(options, logger);

            var factory = new ConnectionFactory
            {
                HostName = consumer._settings.HostName,
                Port = consumer._settings.Port,
                UserName = consumer._settings.UserName,
                Password = consumer._settings.Password,
                VirtualHost = consumer._settings.VirtualHost,
                AutomaticRecoveryEnabled = true,
                NetworkRecoveryInterval = TimeSpan.FromSeconds(10)
            };

            consumer._connection = await factory.CreateConnectionAsync();
            consumer._channel = await consumer._connection.CreateChannelAsync();

            await consumer._channel.BasicQosAsync(prefetchSize: 0, prefetchCount: 1, global: false);

            return consumer;
        }

        public async Task Subscribe<T>(string queueName, Func<T, Task> handler)
        {
            if (_channel == null) throw new InvalidOperationException("Channel not initialized.");

            await _channel.QueueDeclareAsync(
                queue: queueName,
                durable: true,
                exclusive: false,
                autoDelete: false,
                arguments: null
            );
            var consumer = new AsyncEventingBasicConsumer(_channel);
            consumer.ReceivedAsync += async (model, ea) =>
            {
                try
                {
                    var body = ea.Body.ToArray();
                    var json = Encoding.UTF8.GetString(body);
                    var message = JsonSerializer.Deserialize<T>(json);

                    if (message != null)
                    {
                        await handler(message);
                        await _channel.BasicAckAsync(ea.DeliveryTag, multiple: false);
                        _logger.LogInformation("Message processed from queue {Queue}", queueName);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing message from queue {Queue}", queueName);
                    await _channel.BasicNackAsync(ea.DeliveryTag, multiple: false, requeue: true);
                }
            };

            await _channel.BasicConsumeAsync(queue: queueName, autoAck: false, consumer: consumer);
            _logger.LogInformation("Started consuming from queue {Queue}", queueName);
        }

        public async Task Subscribe<T>(string exchange, string routingKey, string queueName, Func<T, Task> handler)
        {
            if (_channel == null) throw new InvalidOperationException("Channel not initialized.");

            await _channel.ExchangeDeclareAsync(
                exchange: exchange,
                type: ExchangeType.Topic,
                durable: true,
                autoDelete: false
            );

            await _channel.QueueDeclareAsync(
                queue: queueName,
                durable: true,
                exclusive: false,
                autoDelete: false,
                arguments: null
            );

            await _channel.QueueBindAsync(queue: queueName, exchange: exchange, routingKey: routingKey);

            var consumer = new AsyncEventingBasicConsumer(_channel);
            consumer.ReceivedAsync += async (model, ea) =>
            {
                try
                {
                    var body = ea.Body.ToArray();
                    var json = Encoding.UTF8.GetString(body);
                    var message = JsonSerializer.Deserialize<T>(json);

                    if (message != null)
                    {
                        await handler(message);
                        await _channel.BasicAckAsync(deliveryTag: ea.DeliveryTag, multiple: false);
                        _logger.LogInformation($"Message processed from exchange: {exchange}, routing key: {routingKey}");
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Error processing message from exchange: {exchange}");
                    await _channel.BasicNackAsync(deliveryTag: ea.DeliveryTag, multiple: false, requeue: true);
                }
            };

            await _channel.BasicConsumeAsync(queue: queueName, autoAck: false, consumer: consumer);
            _logger.LogInformation($"Started consuming from exchange: {exchange}, routing key: {routingKey}");
        }

        public async ValueTask DisposeAsync()
        {
            if (_channel != null) await _channel.CloseAsync();
            if (_connection != null) await _connection.CloseAsync();
        }
    }
}
