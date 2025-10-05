namespace OrderService.Messaging;

public interface IRabbitMqProducer
{
    void PublishMessage<T>(T message, string queueName);
}