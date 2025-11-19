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
    // Handler để chuyển đổi CarbonCreditIssuedEvent (Domain Event) thành Integration Events
    // Event này được phát khi Carbon Credit được phát hành trực tiếp (không qua verification)
    public class CarbonCreditIssuedIntegrationEventHandler
        : INotificationHandler<DomainEventNotification<CarbonCreditIssuedEvent>>
    {
        private readonly IMessagePublisher _messagePublisher;
        private readonly ILogger<CarbonCreditIssuedIntegrationEventHandler> _logger;

        public CarbonCreditIssuedIntegrationEventHandler(
            IMessagePublisher messagePublisher,
            ILogger<CarbonCreditIssuedIntegrationEventHandler> logger)
        {
            _messagePublisher = messagePublisher;
            _logger = logger;
        }

        public async Task Handle(DomainEventNotification<CarbonCreditIssuedEvent> notification, CancellationToken cancellationToken)
        {
            var domainEvent = notification.DomainEvent;

            _logger.LogInformation(
                "Đã bắt sự kiện CarbonCreditIssuedEvent (wrapped) cho CreditId: {CreditId}, BatchId: {BatchId}. Đang chuẩn bị gửi Integration Events...",
                domainEvent.CreditId, domainEvent.JourneyBatchId);

            // 1. Tạo Integration Event cho Service Wallet (Payment & Infrastructure)
            var walletEvent = new CreditIssuedIntegrationEvent
            {
                OwnerUserId = domainEvent.UserId,
                CreditAmount = domainEvent.AmountKgCO2e,
                ReferenceId = domainEvent.JourneyBatchId.ToString(),
                IssuedAt = new DateTimeOffset(domainEvent.OccurredOn, TimeSpan.Zero)
            };

            // 2. Tạo Integration Event cho Service Marketplace/Trading
            var marketplaceEvent = new CreditInventoryUpdateIntegrationEvent
            {
                CreditId = domainEvent.CreditId,
                TotalAmount = domainEvent.AmountKgCO2e
            };

            try
            {
                // 3. Gửi Integration Events qua IMessagePublisher
                // Routing key "credit_issued" (gạch dưới) để cả 2 queues nhận được:
                // - credit.issued.queue (internal)
                // - wallet_service_credit_queue (Wallet Service)
                await _messagePublisher.PublishIntegrationEventAsync(walletEvent, "credit_issued");
                _logger.LogInformation(
                    "Published CreditIssuedIntegrationEvent for CreditId: {CreditId}, UserId: {UserId}, Amount: {Amount}, ReferenceId: {ReferenceId}. RoutingKey: credit_issued (will be received by credit.issued.queue and wallet_service_credit_queue)",
                    domainEvent.CreditId, walletEvent.OwnerUserId, walletEvent.CreditAmount, walletEvent.ReferenceId);

                await _messagePublisher.PublishIntegrationEventAsync(marketplaceEvent, "credit.inventory.update");
                _logger.LogInformation(
                    "Published CreditInventoryUpdateIntegrationEvent for CreditId: {CreditId}, TotalAmount: {Amount}",
                    domainEvent.CreditId, marketplaceEvent.TotalAmount);

                _logger.LogInformation(
                    "Successfully published 2 Integration Events for CreditId: {CreditId}, BatchId: {BatchId}",
                    domainEvent.CreditId, domainEvent.JourneyBatchId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Error publishing Integration Events for CreditId: {CreditId}, BatchId: {BatchId}. Events may not have been sent.",
                    domainEvent.CreditId, domainEvent.JourneyBatchId);
            }
        }
    }
}

