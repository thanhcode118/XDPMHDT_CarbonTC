using CarbonTC.CarbonLifecycle.Infrastructure.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace CarbonTC.CarbonLifecycle.Infrastructure.BackgroundServices
{
    // Dịch vụ này sẽ tự động chạy nền khi service của bạn khởi động
    public class RabbitMQConsumerService : BackgroundService
    {
        private readonly ILogger<RabbitMQConsumerService> _logger;
        private readonly RabbitMQSettings _settings;
        private IConnection? _connection;
        private IModel? _channel;

        public RabbitMQConsumerService(
            IOptions<RabbitMQSettings> settings,
            ILogger<RabbitMQConsumerService> logger)
        {
            _logger = logger;
            _settings = settings.Value;
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
                _logger.LogInformation("RabbitMQ Consumer Service (HostedService) đã kết nối.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi khởi tạo kết nối RabbitMQ Consumer.");
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

            // TODO: Đăng ký (subscribe) vào các sự kiện MÀ BẠN CẦN NGHE
            // Hiện tại, Service 2 không CẦN NGHE sự kiện nào, nên chúng ta để trống

            _logger.LogInformation("RabbitMQ Consumer Service đang chạy (chưa đăng ký nghe sự kiện nào).");
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