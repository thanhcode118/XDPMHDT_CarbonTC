using MediatR;
using CarbonTC.CarbonLifecycle.Domain.Events;

namespace CarbonTC.CarbonLifecycle.Application.Common
{
    // Lớp này bọc một Domain Event để nó có thể được
    // publish qua MediatR (vì nó implement INotification)
    public class DomainEventNotification<TDomainEvent> : INotification where TDomainEvent : IDomainEvent
    {
        public TDomainEvent DomainEvent { get; }

        public DomainEventNotification(TDomainEvent domainEvent)
        {
            DomainEvent = domainEvent;
        }
    }
}