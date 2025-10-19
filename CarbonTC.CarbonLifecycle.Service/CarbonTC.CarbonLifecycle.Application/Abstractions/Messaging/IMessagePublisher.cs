// Interface dùng để publish các sự kiện miền (domain events) lên message broker

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CarbonTC.CarbonLifecycle.Domain.Events;

namespace CarbonTC.CarbonLifecycle.Application.Abstractions.Messaging
{
    public interface IMessagePublisher
    {
        Task PublishAsync<TEvent>(TEvent @event, string routingKey = null) where TEvent : IDomainEvent;

        Task PublishBatchAsync<TEvent>(IEnumerable<TEvent> events, string routingKey = null) where TEvent : IDomainEvent;
    }
}
