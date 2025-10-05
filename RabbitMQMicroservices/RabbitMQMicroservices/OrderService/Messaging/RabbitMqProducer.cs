using RabbitMQ.Client;
using System.Text;
using System.Text.Json;

namespace OrderService.Messaging;

public class RabbitMqProducer : IRabbitMqProducer
{
    private readonly IConfiguration _config;

    public RabbitMqProducer(IConfiguration config)
    {
        _config = config;
    }

    public void PublishMessage<T>(T message, string queueName)
    {
        var factory = new ConnectionFactory()
        {
            // Đọc HostName từ cấu hình môi trường (do Docker Compose inject)
            HostName = _config["RabbitMq:HostName"],
            UserName = _config["RabbitMq:UserName"],
            Password = _config["RabbitMq:Password"]
        };

        using (var connection = factory.CreateConnection())
        using (var channel = connection.CreateModel())
        {
            // Đảm bảo queue đã được khai báo
            channel.QueueDeclare(queue: queueName,
                                 durable: false,
                                 exclusive: false,
                                 autoDelete: false,
                                 arguments: null);

            var jsonString = JsonSerializer.Serialize(message);
            var body = Encoding.UTF8.GetBytes(jsonString);

            channel.BasicPublish(exchange: "",
                                 routingKey: queueName,
                                 basicProperties: null,
                                 body: body);

            Console.WriteLine($" [x] Sent message to {queueName} from OrderService.");
        }
    }
}