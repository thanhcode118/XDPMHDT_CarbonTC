using CarbonTC.CarbonLifecycle.Domain.Events; 
using System.Threading.Tasks;

namespace CarbonTC.CarbonLifecycle.Domain.Abstractions
{
    public interface IDomainEventDispatcher
    {
        Task Dispatch(IDomainEvent domainEvent);
    }
}