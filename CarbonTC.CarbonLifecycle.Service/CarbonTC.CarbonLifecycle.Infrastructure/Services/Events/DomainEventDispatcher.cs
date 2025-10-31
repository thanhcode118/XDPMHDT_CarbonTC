using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using CarbonTC.CarbonLifecycle.Application.Abstractions.Messaging;
using CarbonTC.CarbonLifecycle.Domain.Events;
using CarbonTC.CarbonLifecycle.Domain.Abstractions;
using System.Reflection;
using CarbonTC.CarbonLifecycle.Application.IntegrationEvents;
using MediatR;
using CarbonTC.CarbonLifecycle.Application.Common;

namespace CarbonTC.CarbonLifecycle.Infrastructure.Services.Events
{
    public class DomainEventDispatcher : IDomainEventDispatcher
    {
        private readonly IMessagePublisher _messagePublisher;
        private readonly ILogger<DomainEventDispatcher> _logger;
        private readonly IMediator _mediator; 

        public DomainEventDispatcher(
            IMessagePublisher messagePublisher,
            ILogger<DomainEventDispatcher> logger,
            IMediator mediator)
        {
            _messagePublisher = messagePublisher ?? throw new ArgumentNullException(nameof(messagePublisher));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _mediator = mediator ?? throw new ArgumentNullException(nameof(mediator)); 
        }

        public Task Dispatch(IDomainEvent domainEvent)
        {
            // 1. Lấy phương thức generic 
            var genericMethodInfo = GetType().GetMethod(
                "DispatchInternal",
                BindingFlags.NonPublic | BindingFlags.Instance
            );

            if (genericMethodInfo == null)
            {
                var error = "Không thể tìm thấy phương thức DispatchInternal<TEvent> private.";
                _logger.LogError(error);
                return Task.FromException(new MissingMethodException(error));
            }

            // 2. Tạo một tham chiếu phương thức cụ thể (ví dụ: DispatchInternal<JourneyBatchSubmittedForVerificationEvent>)
            var specificMethod = genericMethodInfo.MakeGenericMethod(domainEvent.GetType());

            // 3. Gọi phương thức đó và trả về Task
            try
            {
                return (Task)specificMethod.Invoke(this, new object[] { domainEvent });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi gọi generic Dispatch method qua reflection.");
                return Task.FromException(ex);
            }
        }

        private async Task DispatchInternal<TEvent>(TEvent domainEvent) where TEvent : IDomainEvent
        {
            if (domainEvent == null)
                throw new ArgumentNullException(nameof(domainEvent));

            // === 1. Gửi ra RabbitMQ (External) ===
            try
            {
                var routingKey = GenerateRoutingKey(domainEvent);
                await _messagePublisher.PublishAsync(domainEvent, routingKey);

                _logger.LogInformation(
                    "Domain event dispatched externally: {EventType}, RoutingKey: {RoutingKey}, OccurredOn: {OccurredOn}",
                    domainEvent.GetType().Name,
                    routingKey,
                    domainEvent.OccurredOn
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Failed to dispatch domain event externally: {EventType}",
                    domainEvent.GetType().Name
                );
                // Cân nhắc có nên throw hay không, tạm thời để tiếp tục
            }

            // === 2. Gửi vào MediatR (Internal) NẾU đây là sự kiện Domain thuần túy ===
            if (IsPureDomainEvent(domainEvent))
            {
                try
                {
                    // Bọc sự kiện domain trong INotification wrapper
                    var notification = new DomainEventNotification<TEvent>(domainEvent);

                    // Publish nội bộ
                    await _mediator.Publish(notification);

                    _logger.LogInformation(
                        "Domain event dispatched internally via MediatR: {EventType}",
                        domainEvent.GetType().Name
                    );
                }
                catch (Exception ex)
                {
                    _logger.LogError(
                        ex,
                        "Failed to dispatch domain event internally via MediatR: {EventType}",
                        domainEvent.GetType().Name
                    );
                    throw; // Lỗi dispatch nội bộ thì nên throw
                }
            }
        }

        private bool IsPureDomainEvent(IDomainEvent domainEvent)
        {
            var type = domainEvent.GetType();
            // Nếu event nằm trong namespace IntegrationEvents, nó là Integration Event
            // và không nên được publish lại lên MediatR.
            if (type.Namespace == typeof(CreditIssuedIntegrationEvent).Namespace)
            {
                return false;
            }
            return true;
        }

        // Sửa hàm này để thêm 2 DTOs 
        private string GenerateRoutingKey<TEvent>(TEvent domainEvent) where TEvent : IDomainEvent
        {
            var eventTypeName = domainEvent.GetType().Name;

            return eventTypeName switch
            {
                // 1. Dành cho Service 4 (Wallet)
                nameof(CreditIssuedIntegrationEvent) => "credit.issued",

                // 2. Dành cho Service 3 (Marketplace)
                //  dùng key "credit.inventory.update" để gửi
                // Service 3 sẽ BIND "credit_inventory_queue" của họ vào key này
                nameof(CreditInventoryUpdateIntegrationEvent) => "credit.inventory.update",

                nameof(JourneyBatchSubmittedForVerificationEvent) => "carbonlifecycle.journeybatch.submitted",
                nameof(VerificationRequestApprovedEvent) => "carbonlifecycle.verification.approved",
                nameof(VerificationRequestRejectedEvent) => "carbonlifecycle.verification.rejected",
                nameof(VerificationRequestCreatedEvent) => "carbonlifecycle.verification.created",
                nameof(CarbonCreditsApprovedEvent) => "carbonlifecycle.carboncredit.approved",
                nameof(CarbonCreditsRejectedEvent) => "carbonlifecycle.carboncredit.rejected",
                _ => $"carbonlifecycle.{eventTypeName.Replace("Event", "").ToLower()}"
            };
        }
    }
}