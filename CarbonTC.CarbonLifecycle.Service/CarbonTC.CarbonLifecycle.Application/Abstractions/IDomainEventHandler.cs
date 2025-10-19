using CarbonTC.CarbonLifecycle.Domain.Events;
using System.Threading.Tasks;

namespace CarbonTC.CarbonLifecycle.Application.Abstractions 
{
    public interface IDomainEventHandler<TEvent> where TEvent : IDomainEvent
    {
        Task Handle(TEvent domainEvent);
    }
}