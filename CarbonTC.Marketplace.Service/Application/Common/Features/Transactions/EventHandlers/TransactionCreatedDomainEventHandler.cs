using Application.Common.Interfaces;
using Domain.Events.Transactions;
using MediatR;
using RabbitMQ.Client;

namespace Application.Common.Features.Transactions.EventHandlers
{
    public class TransactionCreatedDomainEventHandler : INotificationHandler<TransactionCreatedDomainEvent>
    {
        private readonly IIntegrationEventService _integrationEventService;

        public TransactionCreatedDomainEventHandler(IIntegrationEventService integrationEventService)
        {
            _integrationEventService = integrationEventService;
        }

        public async Task Handle(TransactionCreatedDomainEvent notification, CancellationToken cancellationToken)
        {
            await _integrationEventService.PublishAsync(notification, "TransactionCreate", ExchangeType.Fanout, "");
        }
    }
}
