using CarbonTC.CarbonLifecycle.Application.Abstractions.Messaging;
using CarbonTC.CarbonLifecycle.Domain.Events;
using MediatR;
using Microsoft.Extensions.Logging;
using System.Threading;
using System.Threading.Tasks;
using CarbonTC.CarbonLifecycle.Application.IntegrationEvents;
using CarbonTC.CarbonLifecycle.Application.Common; // <-- Thêm 1
using CarbonTC.CarbonLifecycle.Domain.Abstractions; // <-- Thêm 2

namespace CarbonTC.CarbonLifecycle.Application.IntegrationEvents.EventHandlers
{
    // Lắng nghe sự kiện Domain đã được "bọc"
    public class CreditIssuanceIntegrationEventHandler
        : INotificationHandler<DomainEventNotification<CarbonCreditsApprovedEvent>> // <-- Sửa 3
    {
        // Sửa: Dùng IDomainEventDispatcher để gửi Integration Events mới
        private readonly IDomainEventDispatcher _eventDispatcher; // <-- Sửa 4
        private readonly ILogger<CreditIssuanceIntegrationEventHandler> _logger;

        public CreditIssuanceIntegrationEventHandler(
            IDomainEventDispatcher eventDispatcher, // <-- Sửa 5
            ILogger<CreditIssuanceIntegrationEventHandler> logger)
        {
            _eventDispatcher = eventDispatcher; // <-- Sửa 6
            _logger = logger;
        }

        // Hàm Handle bây giờ nhận wrapper notification
        public async Task Handle(DomainEventNotification<CarbonCreditsApprovedEvent> notification, CancellationToken cancellationToken)
        {
            // Mở bọc để lấy sự kiện Domain gốc
            var domainEvent = notification.DomainEvent; // <-- Sửa 7

            _logger.LogInformation(
                "Đã bắt sự kiện CarbonCreditsApprovedEvent (wrapped) cho BatchId: {BatchId}. Đang chuẩn bị gửi Integration Events...",
                domainEvent.JourneyBatchId);

            // 1. Tạo DTO sự kiện cho Service 4 (Wallet)
            var walletEvent = new CreditIssuedIntegrationEvent
            {
                OwnerUserId = domainEvent.UserId,
                CreditAmount = (decimal)domainEvent.ApprovedCreditAmount.Value, // Chuyển từ ValueObject
                ReferenceId = domainEvent.JourneyBatchId.ToString(), // Dùng BatchId làm tham chiếu
                IssuedAt = domainEvent.OccurredOn
            };

            // 2. Tạo DTO sự kiện cho Service 3 (Marketplace)
            var marketplaceEvent = new CreditInventoryUpdateIntegrationEvent
            {
                CreditId = domainEvent.CreditId, // Lấy từ sự kiện domain
                TotalAmount = (decimal)domainEvent.ApprovedCreditAmount.Value
            };

            try
            {
                // 3. Gửi 2 sự kiện MỚI này qua Dispatcher
                // Dispatcher sẽ publish chúng ra RabbitMQ và KHÔNG publish lại
                // lên MediatR (nhờ logic `IsPureDomainEvent` đã thêm ở Bước 2)
                await _eventDispatcher.Dispatch(walletEvent); // <-- Sửa 8
                await _eventDispatcher.Dispatch(marketplaceEvent); // <-- Sửa 9

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