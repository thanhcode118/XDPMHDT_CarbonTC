using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using CarbonTC.CarbonLifecycle.Application.Abstractions.Messaging;
using CarbonTC.CarbonLifecycle.Domain.Events;
using CarbonTC.CarbonLifecycle.Domain.Abstractions;
using System.Reflection; // <-- Thêm using này

namespace CarbonTC.CarbonLifecycle.Infrastructure.Services.Events
{
    public class DomainEventDispatcher : IDomainEventDispatcher
    {
        private readonly IMessagePublisher _messagePublisher;
        private readonly ILogger<DomainEventDispatcher> _logger;

        public DomainEventDispatcher(
            IMessagePublisher messagePublisher,
            ILogger<DomainEventDispatcher> logger)
        {
            _messagePublisher = messagePublisher ?? throw new ArgumentNullException(nameof(messagePublisher));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// Phương thức public duy nhất mà Interface yêu cầu.
        /// Nó sử dụng Reflection để gọi phương thức generic private bên dưới.
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

        /// Phương thức helper generic (private) để xử lý logic publish
        private async Task DispatchInternal<TEvent>(TEvent domainEvent) where TEvent : IDomainEvent
        {
            if (domainEvent == null)
                throw new ArgumentNullException(nameof(domainEvent));

            try
            {
                var routingKey = GenerateRoutingKey(domainEvent);

                await _messagePublisher.PublishAsync(domainEvent, routingKey);

                _logger.LogInformation(
                    "Domain event dispatched: {EventType}, RoutingKey: {RoutingKey}, OccurredOn: {OccurredOn}",
                    domainEvent.GetType().Name,
                    routingKey,
                    domainEvent.OccurredOn
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Failed to dispatch domain event: {EventType}",
                    domainEvent.GetType().Name
                );
                throw;
            }
        }

        private string GenerateRoutingKey<TEvent>(TEvent domainEvent) where TEvent : IDomainEvent
        {
            var eventTypeName = domainEvent.GetType().Name;

            return eventTypeName switch
            {
                nameof(JourneyBatchSubmittedForVerificationEvent) => "carbonlifecycle.journeybatch.submitted",
                nameof(VerificationRequestApprovedEvent) => "carbonlifecycle.verification.approved",
                nameof(VerificationRequestRejectedEvent) => "carbonlifecycle.verification.rejected",
                // Thêm các event khác từ Domain/Events nếu cần
                nameof(VerificationRequestCreatedEvent) => "carbonlifecycle.verification.created",
                nameof(CarbonCreditsApprovedEvent) => "carbonlifecycle.carboncredit.approved",
                nameof(CarbonCreditsRejectedEvent) => "carbonlifecycle.carboncredit.rejected",
                _ => $"carbonlifecycle.{eventTypeName.Replace("Event", "").ToLower()}"
            };
        }
    }
}