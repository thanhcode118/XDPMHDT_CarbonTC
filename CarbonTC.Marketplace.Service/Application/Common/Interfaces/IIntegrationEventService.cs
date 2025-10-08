namespace Application.Common.Interfaces
{
    public interface IIntegrationEventService
    {
        Task PublishAsync<T>(T integrationEvent, CancellationToken cancellationToken = default) where T : class;
    }
}
