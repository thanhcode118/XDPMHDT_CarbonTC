using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System.Text;
using System.Text.Json;

namespace EmailService.Messaging;

public class RabbitMqConsumerService : BackgroundService
{
    private readonly IConfiguration _config;
    private IConnection? _connection;
    private IModel? _channel;
    private const string QueueName = "order_created_queue";

    public RabbitMqConsumerService(IConfiguration config)
    {
        _config = config;
        InitializeRabbitMq();
    }

    private void InitializeRabbitMq()
    {
        try
        {
            var factory = new ConnectionFactory()
            {
                HostName = _config["RabbitMq:HostName"],
                // SỬA LỖI: Thêm thông tin đăng nhập
                UserName = _config["RabbitMq:UserName"],
                Password = _config["RabbitMq:Password"]
            };

            _connection = factory.CreateConnection();
            _channel = _connection.CreateModel();

            _channel.QueueDeclare(queue: QueueName,
                                  durable: false,
                                  exclusive: false,
                                  autoDelete: false,
                                  arguments: null);

            Console.WriteLine(" [i] EmailService Consumer Initialized. Waiting for messages...");
        }
        catch (Exception ex)
        {
            Console.WriteLine($" [!] Error initializing RabbitMQ: {ex.Message}. Please ensure RabbitMQ is running and credentials are correct.");
            // Lỗi Not_Authorized sẽ được hiển thị nếu sai credentials.
        }
    }

    protected override Task ExecuteAsync(CancellationToken stoppingToken)
    {
        stoppingToken.ThrowIfCancellationRequested();

        if (_channel == null) return Task.CompletedTask;

        var consumer = new EventingBasicConsumer(_channel);
        consumer.Received += (model, ea) =>
        {
            var body = ea.Body.ToArray();
            var message = Encoding.UTF8.GetString(body);

            using var doc = JsonDocument.Parse(message);
            var root = doc.RootElement;

            string orderId = root.GetProperty("OrderId").ToString();
            string email = root.GetProperty("CustomerEmail").ToString();
            string item = root.GetProperty("ItemName").ToString();

            // LOGIC GỬI EMAIL
            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine($" [v] SUCCESS: Sending email for Order ID: {orderId}");
            Console.WriteLine($" [v] To: {email}, Content: Your order for {item} is confirmed.");
            Console.ResetColor();

            _channel.BasicAck(ea.DeliveryTag, multiple: false);
        };

        _channel.BasicConsume(queue: QueueName,
                              autoAck: false,
                              consumer: consumer);

        return Task.CompletedTask;
    }

    public override void Dispose()
    {
        _channel?.Close();
        _connection?.Close();
        base.Dispose();
    }
}

// KHÔNG THAY ĐỔI: Program.cs