using Application.Common.DTOs;
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
            var transactionWalletDto = new TransactionWalletDto
            {
                TransactionId = notification.TransactionId.ToString(),
                BuyerUserId = notification.BuyerUserId.ToString(),
                SellerUserId = notification.SellerUserId.ToString(),
                MoneyAmount = notification.MoneyAmount,
                CreditAmount = notification.CreditAmount,
                PlatformFee = notification.PlatformFee,    
                CreatedAt = DateTime.UtcNow.ToString("o")
            };
            
            await _integrationEventService.PublishAsync<TransactionWalletDto>(transactionWalletDto, "transactions_exchange", ExchangeType.Direct, "transaction.created");
        }
    }
}
