using Domain.Events.Transactions;
using MediatR;
using RabbitMQ.Client;
using SharedLibrary.Interfaces;

namespace Application.Common.Features.Transactions.EventHandlers
{
    public class TransactionCreatedDomainEventHandler : INotificationHandler<TransactionCreatedDomainEvent>
    {
        private readonly IMessagePublisher _publisher;

        public TransactionCreatedDomainEventHandler(IMessagePublisher publisher)
        {
            _publisher = publisher;
        }

        public async Task Handle(TransactionCreatedDomainEvent notification, CancellationToken cancellationToken)
        {
            await _publisher.PublishAsync("TransactionCreate", ExchangeType.Fanout, "", notification);
        }
    }
}
