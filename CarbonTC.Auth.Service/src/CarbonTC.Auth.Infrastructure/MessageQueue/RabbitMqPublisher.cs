// CarbonTC.Auth.Infrastructure/MessageQueue/RabbitMqPublisher.cs

using System.Text;
using System.Text.Json;
using CarbonTC.Auth.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using RabbitMQ.Client;

namespace CarbonTC.Auth.Infrastructure.MessageQueue;

/// <summary>
/// Implementation của IMessagePublisher sử dụng RabbitMQ
/// </summary>
public class RabbitMqPublisher : IMessagePublisher, IDisposable
{
    private readonly IConnection _connection;
    private readonly IModel _channel;
    private readonly ILogger<RabbitMqPublisher>? _logger;

    public RabbitMqPublisher(IConfiguration configuration, ILogger<RabbitMqPublisher>? logger = null)
    {
        _logger = logger;

        try
        {
            var factory = new ConnectionFactory
            {
                HostName = configuration["RabbitMQ:Host"] ?? "localhost",
                Port = int.Parse(configuration["RabbitMQ:Port"] ?? "5672"),
                UserName = configuration["RabbitMQ:Username"] ?? "guest",
                Password = configuration["RabbitMQ:Password"] ?? "guest",
                // Retry settings
                AutomaticRecoveryEnabled = true,
                NetworkRecoveryInterval = TimeSpan.FromSeconds(10),
                RequestedHeartbeat = TimeSpan.FromSeconds(60)
            };

            _connection = factory.CreateConnection();
            _channel = _connection.CreateModel();

            _logger?.LogInformation("✅ RabbitMQ Publisher connected successfully");
        }
        catch (Exception ex)
        {
            _logger?.LogError(ex, "❌ Failed to connect to RabbitMQ");
            throw;
        }
    }

    /// <summary>
    /// Publish message tới RabbitMQ Exchange
    /// </summary>
    public Task PublishAsync<T>(
        string exchange,
        string routingKey,
        T message,
        string exchangeType = "topic")
    {
        try
        {
            // 1. Declare Exchange (idempotent - nếu đã tồn tại thì không tạo lại)
            _channel.ExchangeDeclare(
                exchange: exchange,
                type: exchangeType.ToLower(), // topic, direct, fanout, headers
                durable: true,      // Exchange tồn tại ngay cả khi RabbitMQ restart
                autoDelete: false   // Không tự động xóa khi không còn queue nào bind
            );

            // 2. Serialize message thành JSON
            var jsonMessage = JsonSerializer.Serialize(message, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = false
            });

            var body = Encoding.UTF8.GetBytes(jsonMessage);

            // 3. Tạo properties cho message
            var properties = _channel.CreateBasicProperties();
            properties.Persistent = true;  // Message sẽ được lưu vào disk
            properties.ContentType = "application/json";
            properties.ContentEncoding = "utf-8";
            properties.DeliveryMode = 2;   // Persistent
            properties.Timestamp = new AmqpTimestamp(DateTimeOffset.UtcNow.ToUnixTimeSeconds());

            // 4. Publish message
            _channel.BasicPublish(
                exchange: exchange,
                routingKey: routingKey,
                basicProperties: properties,
                body: body
            );

            _logger?.LogInformation(
                "📤 Published message to Exchange: {Exchange}, RoutingKey: {RoutingKey}, Message: {Message}",
                exchange, routingKey, jsonMessage
            );

            return Task.CompletedTask;
        }
        catch (Exception ex)
        {
            _logger?.LogError(ex,
                "❌ Failed to publish message to Exchange: {Exchange}, RoutingKey: {RoutingKey}",
                exchange, routingKey
            );
            throw;
        }
    }

    /// <summary>
    /// Dispose resources
    /// </summary>
    public void Dispose()
    {
        try
        {
            _channel?.Close();
            _channel?.Dispose();
            _connection?.Close();
            _connection?.Dispose();

            _logger?.LogInformation("🔌 RabbitMQ Publisher disposed");
        }
        catch (Exception ex)
        {
            _logger?.LogError(ex, "Error disposing RabbitMQ Publisher");
        }
    }
}