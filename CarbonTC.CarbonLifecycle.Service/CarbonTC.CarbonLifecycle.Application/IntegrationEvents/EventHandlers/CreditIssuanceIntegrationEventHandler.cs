using CarbonTC.CarbonLifecycle.Application.Abstractions.Messaging;
using CarbonTC.CarbonLifecycle.Domain.Events;
using MediatR;
using Microsoft.Extensions.Logging;
using System;
using System.Threading;
using System.Threading.Tasks;
using CarbonTC.CarbonLifecycle.Application.IntegrationEvents;
using CarbonTC.CarbonLifecycle.Application.Common;

namespace CarbonTC.CarbonLifecycle.Application.IntegrationEvents.EventHandlers
{
    // Lắng nghe sự kiện Domain đã được "bọc"
    public class CreditIssuanceIntegrationEventHandler
        : INotificationHandler<DomainEventNotification<CarbonCreditsApprovedEvent>> // <-- Sửa 3
    {
        // Sửa: Dùng IMessagePublisher để gửi Integration Events (vì chúng không còn implement IDomainEvent)
        private readonly IMessagePublisher _messagePublisher; 
        private readonly ILogger<CreditIssuanceIntegrationEventHandler> _logger;

        public CreditIssuanceIntegrationEventHandler(
            IMessagePublisher messagePublisher,
            ILogger<CreditIssuanceIntegrationEventHandler> logger)
        {
            _messagePublisher = messagePublisher;
            _logger = logger;
        }

        // Hàm Handle bây giờ nhận wrapper notification
        public async Task Handle(DomainEventNotification<CarbonCreditsApprovedEvent> notification, CancellationToken cancellationToken)
        {
            // Mở bọc để lấy sự kiện Domain gốc
            var domainEvent = notification.DomainEvent;

            _logger.LogInformation(
                "Đã bắt sự kiện CarbonCreditsApprovedEvent (wrapped) cho BatchId: {BatchId}. Đang chuẩn bị gửi Integration Events...",
                domainEvent.JourneyBatchId);

            // 1. Tạo DTO sự kiện cho Service 4 (Wallet)
            var walletEvent = new CreditIssuedIntegrationEvent
            {
                OwnerUserId = domainEvent.UserId,
                CreditAmount = (decimal)domainEvent.ApprovedCreditAmount.Value, // Chuyển từ ValueObject
                ReferenceId = domainEvent.JourneyBatchId.ToString(), // Dùng BatchId làm tham chiếu
                IssuedAt = new DateTimeOffset(domainEvent.OccurredOn, TimeSpan.Zero) // Chuyển DateTime sang DateTimeOffset
            };

            // 2. Tạo DTO sự kiện cho Service 3 (Marketplace)
            var marketplaceEvent = new CreditInventoryUpdateIntegrationEvent
            {
                CreditId = domainEvent.CreditId, // Lấy từ sự kiện domain
                TotalAmount = (decimal)domainEvent.ApprovedCreditAmount.Value
            };

            try
            {
                // 3. Gửi 2 sự kiện MỚI này qua IMessagePublisher
                // Sử dụng PublishIntegrationEventAsync vì các events này không còn implement IDomainEvent
                await _messagePublisher.PublishIntegrationEventAsync(walletEvent, "credit.issued");
                await _messagePublisher.PublishIntegrationEventAsync(marketplaceEvent, "credit.inventory.update");

                _logger.LogInformation(
                    "Đã gửi thành công 2 Integration Events cho BatchId: {BatchId}",
                    domainEvent.JourneyBatchId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Lỗi khi gửi Integration Events cho BatchId: {BatchId}",
                    domainEvent.JourneyBatchId);
            }
        }
    }
}