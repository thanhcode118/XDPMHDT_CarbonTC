// CarbonTC.Auth.Application/Interfaces/IMessagePublisher.cs
namespace CarbonTC.Auth.Application.Interfaces;

public interface IMessagePublisher
{
    Task PublishAsync<T>(string exchange, string routingKey, T message);
}