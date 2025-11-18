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
                "[CreditIssuanceIntegrationEventHandler] Bắt đầu xử lý CarbonCreditsApprovedEvent. BatchId: {BatchId}, UserId: {UserId}, CreditId: {CreditId}, Amount: {Amount}",
                domainEvent.JourneyBatchId, domainEvent.UserId, domainEvent.CreditId, domainEvent.ApprovedCreditAmount.Value);

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

            // Gửi từng event riêng biệt để đảm bảo cả 2 đều được gửi, ngay cả khi 1 event fail
            bool walletEventPublished = false;
            bool marketplaceEventPublished = false;

            // 3.1. Gửi CreditIssuedIntegrationEvent (Wallet Service)
            try
            {
                // Routing key "credit_issued" (gạch dưới) để cả 2 queues nhận được:
                // - credit.issued.queue (internal)
                // - wallet_service_credit_queue (Wallet Service)
                await _messagePublisher.PublishIntegrationEventAsync(walletEvent, "credit_issued");
                walletEventPublished = true;
                _logger.LogInformation(
                    "[CreditIssuanceIntegrationEventHandler] ✅ Published CreditIssuedIntegrationEvent. BatchId: {BatchId}, UserId: {UserId}, Amount: {Amount}, ReferenceId: {ReferenceId}, RoutingKey: credit_issued, Exchange: carbonlifecycle.events",
                    domainEvent.JourneyBatchId, walletEvent.OwnerUserId, walletEvent.CreditAmount, walletEvent.ReferenceId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "[CreditIssuanceIntegrationEventHandler] ❌ Failed to publish CreditIssuedIntegrationEvent. BatchId: {BatchId}, CreditId: {CreditId}",
                    domainEvent.JourneyBatchId, domainEvent.CreditId);
            }

            // 3.2. Gửi CreditInventoryUpdateIntegrationEvent (Marketplace Service)
            try
            {
                await _messagePublisher.PublishIntegrationEventAsync(marketplaceEvent, "credit.inventory.update");
                marketplaceEventPublished = true;
                _logger.LogInformation(
                    "[CreditIssuanceIntegrationEventHandler] ✅ Published CreditInventoryUpdateIntegrationEvent. BatchId: {BatchId}, CreditId: {CreditId}, TotalAmount: {Amount}, RoutingKey: credit.inventory.update, Exchange: carbonlifecycle.events",
                    domainEvent.JourneyBatchId, marketplaceEvent.CreditId, marketplaceEvent.TotalAmount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "[CreditIssuanceIntegrationEventHandler] ❌ Failed to publish CreditInventoryUpdateIntegrationEvent. BatchId: {BatchId}, CreditId: {CreditId}",
                    domainEvent.JourneyBatchId, domainEvent.CreditId);
            }

            // Tổng kết
            if (walletEventPublished && marketplaceEventPublished)
            {
                _logger.LogInformation(
                    "[CreditIssuanceIntegrationEventHandler] ✅ Successfully published BOTH Integration Events. BatchId: {BatchId}, CreditId: {CreditId}",
                    domainEvent.JourneyBatchId, domainEvent.CreditId);
            }
            else
            {
                _logger.LogWarning(
                    "[CreditIssuanceIntegrationEventHandler] ⚠️ Partially published Integration Events. WalletEvent: {WalletEvent}, MarketplaceEvent: {MarketplaceEvent}, BatchId: {BatchId}, CreditId: {CreditId}",
                    walletEventPublished, marketplaceEventPublished, domainEvent.JourneyBatchId, domainEvent.CreditId);
            }
        }
    }
}