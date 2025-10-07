using MediatR;

namespace Domain.Common
{
    public interface IDomainEvent : INotification
    {
        public DateTime OccurredOn => DateTime.UtcNow;
    }
}
