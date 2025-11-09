using CarbonTC.CarbonLifecycle.Infrastructure.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.DependencyInjection;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using RabbitMQ.Client.Exceptions;
using System;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using CarbonTC.CarbonLifecycle.Application.IntegrationEvents;

namespace CarbonTC.CarbonLifecycle.Infrastructure.BackgroundServices
{
    // Dịch vụ này sẽ tự động chạy nền khi service của bạn khởi động
    public class RabbitMQConsumerService : BackgroundService
    {
        private readonly ILogger<RabbitMQConsumerService> _logger;
        private readonly RabbitMQSettings _settings;
        private readonly IServiceScopeFactory _serviceScopeFactory;
        private IConnection? _connection;
        private IModel? _channel;

        public RabbitMQConsumerService(
            IOptions<RabbitMQSettings> settings,
            ILogger<RabbitMQConsumerService> logger,
            IServiceScopeFactory serviceScopeFactory)
        {
            _logger = logger;
            _settings = settings.Value;
            _serviceScopeFactory = serviceScopeFactory;
            InitializeRabbitMQ();
        }

        private void InitializeRabbitMQ()
        {
            int retryCount = 0;
            while (_connection == null && retryCount < 5) // Thử lại tối đa 5 lần
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
                    _logger.LogInformation("RabbitMQ Consumer Service (HostedService) đã kết nối.");
                    
                    // Đảm bảo Exchange GỬI (credits_exchange) được khai báo nếu Service hiện tại không tự động tạo ra nó
                    // Nếu bạn không biết Exchange GỬI (credits_exchange) được cấu hình là gì, bạn cần phải khai báo thủ công:
                    _channel.ExchangeDeclare(
                        exchange: "credits_exchange", // <-- Tên Exchange của Service khác đang gửi đến bạn
                        type: "topic", // Hoặc type phù hợp với Service GỬI
                        durable: true
                    );

                    // 1. KHAI BÁO QUEUE CHO SERVICE HIỆN TẠI (Consumer)
                    _channel.QueueDeclare(
                        queue: "carbon_lifecycle_issue_queue", // <-- Tên Queue đã tạo
                        durable: true,
                        exclusive: false,
                        autoDelete: false,
                        arguments: null
                    );

                    // 2. TẠO BINDING CHO QUEUE (liên kết với Exchange GỬI)
                    _channel.QueueBind(
                        queue: "carbon_lifecycle_issue_queue",
                        exchange: "credits_exchange", // <-- Exchange của Service GỬI
                        routingKey: "credit.issued" // <-- Routing Key bạn cần nghe
                    );

                    _logger.LogInformation("RabbitMQ Consumer: Đã khai báo Queue 'carbon_lifecycle_issue_queue' và Binding 'credit.issued'.");
                    
                    break; // Thoát vòng lặp nếu thành công
                }
                catch (BrokerUnreachableException ex)
                {
                    retryCount++;
                    _logger.LogError(ex, "Lỗi khi khởi tạo kết nối RabbitMQ Consumer. Thử lại lần {Attempt}/{MaxAttempts} sau 5 giây...",
                        retryCount, 5);
                    // Dùng Task.Delay trong BackgroundService là an toàn
                    Task.Delay(TimeSpan.FromSeconds(5)).Wait(); 
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Lỗi không xác định khi khởi tạo kết nối RabbitMQ.");
                    break; 
                }
            }
        }

        protected override Task ExecuteAsync(CancellationToken stoppingToken)
        {
            if (_channel == null)
            {
                _logger.LogWarning("RabbitMQ Channel chưa được khởi tạo. Consumer service sẽ không chạy.");
                return Task.CompletedTask;
            }

            stoppingToken.ThrowIfCancellationRequested();

            // Lớp EventingBasicConsumer giúp lắng nghe các sự kiện
            var consumer = new EventingBasicConsumer(_channel);
            
            // Đăng ký sự kiện Received
            consumer.Received += async (model, ea) =>
            {
                var body = ea.Body.ToArray();
                var message = Encoding.UTF8.GetString(body);
                
                try
                {
                    // GIẢI TUẦN TỰ HÓA TIN NHẮN
                    var integrationEvent = JsonSerializer.Deserialize<CreditIssuedIntegrationEvent>(message);
                    
                    // XỬ LÝ SỰ KIỆN TẠI ĐÂY (Ví dụ: dùng MediatR để dispatch một command/handler)
                    // Tạo scope để sử dụng scoped services như IMediator
                    using (var scope = _serviceScopeFactory.CreateScope())
                    {
                        // var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();
                        // await mediator.Send(new ProcessCreditIssuanceCommand(integrationEvent));
                        
                        // TODO: Thêm logic xử lý sự kiện tại đây
                        _logger.LogInformation("Nhận được CreditIssuedEvent: {ReferenceId}", integrationEvent?.ReferenceId);
                    }

                    // CHỈ XÁC NHẬN (ACK) TIN NHẮN SAU KHI ĐÃ XỬ LÝ THÀNH CÔNG
                    _channel.BasicAck(ea.DeliveryTag, multiple: false);
                    _logger.LogInformation("Nhận & Xử lý thành công CreditIssuedEvent: {ReferenceId}", integrationEvent?.ReferenceId);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Lỗi khi xử lý tin nhắn CreditIssuedEvent. Message: {Message}", message);
                    // NACK tin nhắn để nó có thể được xử lý lại sau (hoặc chuyển sang Dead Letter Queue)
                    _channel.BasicNack(ea.DeliveryTag, multiple: false, requeue: true); 
                }
            };

            // Bắt đầu tiêu thụ tin nhắn
            _channel.BasicConsume(
                queue: "carbon_lifecycle_issue_queue",
                autoAck: false, // RẤT QUAN TRỌNG: Phải đặt false để tự quản lý Ack/Nack
                consumer: consumer
            );
            
            _logger.LogInformation("RabbitMQ Consumer Service đang lắng nghe Queue 'carbon_lifecycle_issue_queue'.");
            return Task.CompletedTask;
        }

        public override void Dispose()
        {
            _channel?.Close();
            _connection?.Close();
            base.Dispose();
        }
    }
}