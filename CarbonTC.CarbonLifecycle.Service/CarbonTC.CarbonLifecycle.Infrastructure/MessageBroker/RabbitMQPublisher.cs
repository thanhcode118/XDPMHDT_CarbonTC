using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using CarbonTC.CarbonLifecycle.Application.Abstractions.Messaging;
using CarbonTC.CarbonLifecycle.Domain.Events;
using CarbonTC.CarbonLifecycle.Infrastructure.Configuration;
using Microsoft.EntityFrameworkCore.Metadata;
using RModel = RabbitMQ.Client.IModel;

namespace CarbonTC.CarbonLifecycle.Infrastructure.MessageBroker
{
    public class RabbitMQPublisher : IMessagePublisher, IDisposable
    {
        private readonly RabbitMQSettings _settings;
        private readonly ILogger<RabbitMQPublisher> _logger;
        private IConnection _connection;
        private RModel _channel;
        private readonly object _lock = new object();
        private bool _disposed = false;

        public RabbitMQPublisher(
            IOptions<RabbitMQSettings> settings,
            ILogger<RabbitMQPublisher> logger)
        {
            _settings = settings?.Value ?? throw new ArgumentNullException(nameof(settings));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));

            InitializeRabbitMQ();
        }

        private void InitializeRabbitMQ()
        {
            try
            {
                var factory = new ConnectionFactory
                {
                    HostName = _settings.HostName,
                    Port = _settings.Port,
                    UserName = _settings.UserName,
                    Password = _settings.Password,
                    VirtualHost = _settings.VirtualHost,
                    AutomaticRecoveryEnabled = true,
                    NetworkRecoveryInterval = TimeSpan.FromSeconds(10)
                };

                _connection = factory.CreateConnection();
                _channel = _connection.CreateModel();

                // Declare exchange
                _channel.ExchangeDeclare(
                    exchange: _settings.ExchangeName,
                    type: _settings.ExchangeType,
                    durable: _settings.Durable,
                    autoDelete: _settings.AutoDelete,
                    arguments: null
                );

                _logger.LogInformation(
                    "RabbitMQ connection established. Exchange: {Exchange}, Type: {Type}",
                    _settings.ExchangeName,
                    _settings.ExchangeType
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to initialize RabbitMQ connection");
                throw;
            }
        }

        public async Task PublishAsync<TEvent>(TEvent @event, string routingKey = null)
            where TEvent : IDomainEvent
        {
            if (@event == null)
                throw new ArgumentNullException(nameof(@event));

            await Task.Run(() => PublishWithRetry(@event, routingKey));
        }

        public async Task PublishBatchAsync<TEvent>(IEnumerable<TEvent> events, string routingKey = null)
            where TEvent : IDomainEvent
        {
            if (events == null)
                throw new ArgumentNullException(nameof(events));

            foreach (var @event in events)
            {
                await PublishAsync(@event, routingKey);
            }
        }

        private void PublishWithRetry<TEvent>(TEvent @event, string routingKey)
            where TEvent : IDomainEvent
        {
            int retryCount = 0;
            Exception lastException = null;

            while (retryCount < _settings.RetryCount)
            {
                try
                {
                    EnsureConnection();
                    PublishMessage(@event, routingKey);

                    _logger.LogInformation(
                        "Published event: {EventType}, RoutingKey: {RoutingKey}",
                        @event.GetType().Name,
                        routingKey ?? GenerateRoutingKey(@event)
                    );

                    return;
                }
                catch (Exception ex)
                {
                    lastException = ex;
                    retryCount++;

                    _logger.LogWarning(
                        ex,
                        "Failed to publish event (Attempt {Attempt}/{MaxAttempts}): {EventType}",
                        retryCount,
                        _settings.RetryCount,
                        @event.GetType().Name
                    );

                    if (retryCount < _settings.RetryCount)
                    {
                        Task.Delay(_settings.RetryDelayMilliseconds).Wait();
                        RecreateConnection();
                    }
                }
            }

            _logger.LogError(
                lastException,
                "Failed to publish event after {MaxAttempts} attempts: {EventType}",
                _settings.RetryCount,
                @event.GetType().Name
            );

            throw new InvalidOperationException(
                $"Failed to publish event after {_settings.RetryCount} attempts",
                lastException
            );
        }

        private void PublishMessage<TEvent>(TEvent @event, string routingKey)
            where TEvent : IDomainEvent
        {
            var message = JsonSerializer.Serialize(@event, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = false
            });

            var body = Encoding.UTF8.GetBytes(message);
            var properties = _channel.CreateBasicProperties();
            properties.Persistent = true;
            properties.ContentType = "application/json";
            properties.Type = @event.GetType().Name;
            properties.Timestamp = new AmqpTimestamp(DateTimeOffset.UtcNow.ToUnixTimeSeconds());
            properties.MessageId = Guid.NewGuid().ToString();

            var finalRoutingKey = routingKey ?? GenerateRoutingKey(@event);

            _channel.BasicPublish(
                exchange: _settings.ExchangeName,
                routingKey: finalRoutingKey,
                basicProperties: properties,
                body: body
            );
        }

        private string GenerateRoutingKey<TEvent>(TEvent @event) where TEvent : IDomainEvent
        {
            var eventType = @event.GetType().Name.Replace("Event", "").ToLower();
            return $"carbonlifecycle.{eventType}";
        }

        private void EnsureConnection()
        {
            lock (_lock)
            {
                if (_channel == null || !_channel.IsOpen)
                {
                    RecreateConnection();
                }
            }
        }

        private void RecreateConnection()
        {
            lock (_lock)
            {
                try
                {
                    _channel?.Close();
                    _channel?.Dispose();
                    _connection?.Close();
                    _connection?.Dispose();
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Error while closing existing RabbitMQ connection");
                }

                InitializeRabbitMQ();
            }
        }

        public void Dispose()
        {
            if (_disposed)
                return;

            lock (_lock)
            {
                try
                {
                    _channel?.Close();
                    _channel?.Dispose();
                    _connection?.Close();
                    _connection?.Dispose();

                    _logger.LogInformation("RabbitMQ connection disposed");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error disposing RabbitMQ connection");
                }
                finally
                {
                    _disposed = true;
                }
            }
        }
    }
}