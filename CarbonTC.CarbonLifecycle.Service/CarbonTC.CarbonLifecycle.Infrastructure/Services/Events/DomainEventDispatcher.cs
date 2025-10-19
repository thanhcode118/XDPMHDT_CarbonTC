using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using CarbonTC.CarbonLifecycle.Application.Abstractions.Messaging;
using CarbonTC.CarbonLifecycle.Domain.Events;

namespace CarbonTC.CarbonLifecycle.Infrastructure.Services.Events
{
    /// <summary>
    /// Dispatches domain events to message broker
    /// </summary>
    public interface IDomainEventDispatcher
    {
        Task DispatchAsync<TEvent>(TEvent domainEvent) where TEvent : IDomainEvent;
    }

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

        public async Task DispatchAsync<TEvent>(TEvent domainEvent) where TEvent : IDomainEvent
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
                nameof(CarbonCreditsApprovedEvent) => "carbonlifecycle.carboncredit.approved",
                nameof(CarbonCreditsRejectedEvent) => "carbonlifecycle.carboncredit.rejected",
                nameof(VerificationRequestCreatedEvent) => "carbonlifecycle.verification.created",
                nameof(VerificationRequestApprovedEvent) => "carbonlifecycle.verification.approved",
                nameof(VerificationRequestRejectedEvent) => "carbonlifecycle.verification.rejected",
                _ => $"carbonlifecycle.{eventTypeName.Replace("Event", "").ToLower()}"
            };
        }
    }
}