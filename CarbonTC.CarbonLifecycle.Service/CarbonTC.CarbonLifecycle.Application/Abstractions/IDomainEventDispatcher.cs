using CarbonTC.CarbonLifecycle.Domain.Events; 
using System.Threading.Tasks;

namespace CarbonTC.CarbonLifecycle.Application.Abstractions 
{
    public interface IDomainEventDispatcher
    {
        Task Dispatch(IDomainEvent domainEvent);
    }
}