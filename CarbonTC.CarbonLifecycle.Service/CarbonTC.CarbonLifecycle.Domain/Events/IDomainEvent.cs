// interface cơ bản cho tất cả các Domain Events.

using System;

namespace CarbonTC.CarbonLifecycle.Domain.Events
{
    public interface IDomainEvent
    {
        DateTime OccurredOn { get; }
    }
}