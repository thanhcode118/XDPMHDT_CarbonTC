using EmailService.Messaging;

// Tạo Host cho Worker Service
IHost host = Host.CreateDefaultBuilder(args)
    .ConfigureServices(services =>
    {
        // Thêm Background Service của RabbitMQ Consumer
        services.AddHostedService<RabbitMqConsumerService>();
    })
    .Build();

await host.RunAsync();