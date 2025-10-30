using CarbonTC.CarbonLifecycle.Application.Abstractions.Messaging;
using CarbonTC.CarbonLifecycle.Domain.Events;
using MediatR;
using Microsoft.Extensions.Logging;
using System.Threading;
using System.Threading.Tasks;
using CarbonTC.CarbonLifecycle.Application.IntegrationEvents;


namespace CarbonTC.CarbonLifecycle.Application.IntegrationEvents.EventHandlers
{
    // Lắng nghe sự kiện Domain nội bộ (từ MediatR)
    // Giờ đây 'CarbonCreditsApprovedEvent' đã được nhận diện
    public class CreditIssuanceIntegrationEventHandler
        : INotificationHandler<CarbonCreditsApprovedEvent>
    {
        private readonly IMessagePublisher _messagePublisher;
        private readonly ILogger<CreditIssuanceIntegrationEventHandler> _logger;

        public CreditIssuanceIntegrationEventHandler(
            IMessagePublisher messagePublisher,
            ILogger<CreditIssuanceIntegrationEventHandler> logger)
        {
            _messagePublisher = messagePublisher;
            _logger = logger;
        }

        // Hàm này sẽ tự động chạy khi CarbonCreditsApprovedEvent được dispatch
        public async Task Handle(CarbonCreditsApprovedEvent notification, CancellationToken cancellationToken)
        {
            _logger.LogInformation(
                "Đã bắt sự kiện CarbonCreditsApprovedEvent cho BatchId: {BatchId}. Đang chuẩn bị gửi Integration Events...",
                notification.JourneyBatchId);

            // 1. Tạo DTO sự kiện cho Service 4 (Wallet)
            // (Dòng này đã hết lỗi)
            var walletEvent = new CreditIssuedIntegrationEvent
            {
                OwnerUserId = notification.UserId,
                CreditAmount = (decimal)notification.ApprovedCreditAmount.Value, // Chuyển từ ValueObject
                ReferenceId = notification.JourneyBatchId.ToString(), // Dùng BatchId làm tham chiếu
                IssuedAt = notification.OccurredOn
            };

            // 2. Tạo DTO sự kiện cho Service 3 (Marketplace)
            // (Dòng này cũng đã hết lỗi)
            var marketplaceEvent = new CreditInventoryUpdateIntegrationEvent
            {
                CreditId = notification.CreditId, // Lấy từ sự kiện domain
                TotalAmount = (decimal)notification.ApprovedCreditAmount.Value
            };

            try
            {
                // 3. Gửi cả hai sự kiện qua RabbitMQ
                // (File IMessagePublisher của bạn đã có hàm PublishAsync(IDomainEvent...)
                // và các DTOs của bạn CÓ implement IDomainEvent, nên code này là đúng)
                await _messagePublisher.PublishAsync(walletEvent);
                await _messagePublisher.PublishAsync(marketplaceEvent);

                _logger.LogInformation(
                    "Đã gửi thành công 2 Integration Events cho BatchId: {BatchId}",
                    notification.JourneyBatchId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Lỗi khi gửi Integration Events cho BatchId: {BatchId}",
                    notification.JourneyBatchId);
            }
        }
    }
}