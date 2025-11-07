using CarbonTC.CarbonLifecycle.Domain.Events;

namespace CarbonTC.CarbonLifecycle.Application.Abstractions.Messaging
{
    public interface IMessagePublisher
    {
        // Giữ lại phương thức cũ cho các Domain Event
        Task PublishAsync<TEvent>(TEvent @event, string? routingKey = null) where TEvent : IDomainEvent;

        // ===== THÊM PHƯƠNG THỨC MỚI NÀY =====
        // Phương thức này dùng để gửi các DTOs (Integration Events)
        // mà không cần implement IDomainEvent
        Task PublishIntegrationEventAsync<TEvent>(TEvent @event, string? routingKey = null) where TEvent : class;

        Task PublishBatchAsync<TEvent>(IEnumerable<TEvent> events, string? routingKey = null) where TEvent : IDomainEvent;
    }
}