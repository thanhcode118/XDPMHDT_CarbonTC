// CarbonTC.Auth.Application/Interfaces/IMessagePublisher.cs

namespace CarbonTC.Auth.Application.Interfaces;

/// <summary>
/// Interface để publish message tới RabbitMQ
/// </summary>
public interface IMessagePublisher
{
    /// <summary>
    /// Publish một message tới RabbitMQ Exchange
    /// </summary>
    /// <typeparam name="T">Kiểu dữ liệu của message</typeparam>
    /// <param name="exchange">Tên Exchange</param>
    /// <param name="routingKey">Routing Key</param>
    /// <param name="message">Nội dung message</param>
    /// <param name="exchangeType">Loại Exchange (default: Topic)</param>
    Task PublishAsync<T>(
        string exchange,
        string routingKey,
        T message,
        string exchangeType = "topic"
    );
}