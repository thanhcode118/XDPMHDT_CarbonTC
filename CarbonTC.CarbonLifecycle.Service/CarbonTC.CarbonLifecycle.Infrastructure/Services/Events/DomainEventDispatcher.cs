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
            // IMessagePublisher vẫn được giữ lại để tương thích, nhưng không sử dụng trực tiếp
            // Integration Events sẽ được gửi bởi handlers thông qua IMessagePublisher
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
                var result = specificMethod.Invoke(this, new object[] { domainEvent });
                if (result is Task task)
                {
                    return task;
                }
                return Task.FromException(new InvalidOperationException("Dispatch method did not return a Task"));
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

            // Domain Events chỉ nên được dispatch nội bộ qua MediatR
            // Integration Events sẽ được gửi lên RabbitMQ bởi các handlers tương ứng
            // Điều này tránh Dual Write pattern và Message Duplication
            
            if (IsPureDomainEvent(domainEvent))
            {
                try
                {
                    // Bọc sự kiện domain trong INotification wrapper
                    var notification = new DomainEventNotification<TEvent>(domainEvent);

                    // Publish nội bộ qua MediatR để handlers xử lý
                    // Handlers sẽ chuyển đổi Domain Events thành Integration Events và gửi lên RabbitMQ
                    await _mediator.Publish(notification);

                    _logger.LogInformation(
                        "[DomainEventDispatcher] Domain event dispatched internally via MediatR: {EventType}. Integration events will be published by handlers if needed.",
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
            else
            {
                _logger.LogWarning(
                    "Domain event {EventType} is not a pure domain event and will not be dispatched.",
                    domainEvent.GetType().Name
                );
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

        // Hàm này không còn được sử dụng vì Domain Events không còn được gửi trực tiếp lên RabbitMQ
        // Integration Events sẽ được gửi bởi handlers với routing keys phù hợp
        // Giữ lại để tương thích nếu cần trong tương lai
        private string GenerateRoutingKey<TEvent>(TEvent domainEvent) where TEvent : IDomainEvent
        {
            var eventTypeName = domainEvent.GetType().Name;

            return eventTypeName switch
            {
                // Integration Events routing keys (được sử dụng bởi handlers)
                nameof(CreditIssuedIntegrationEvent) => "credit_issued",
                nameof(CreditInventoryUpdateIntegrationEvent) => "credit.inventory.update",

                // Domain Events routing keys (không còn được sử dụng trực tiếp)
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