using Application.Common.Features.Listings.Commands.CloseAuction;
using Application.Common.Features.Listings.Commands.FinalizeExpiredAuction;
using Application.Common.Features.Listings.Queries.GetExpiredAuctions;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Infrastructure.BackgroundJobs
{
    public class AuctionStatusUpdaterService : BackgroundService
    {
        private readonly ILogger<AuctionStatusUpdaterService> _logger;
        private readonly IServiceProvider _serviceProvider;

        public AuctionStatusUpdaterService(ILogger<AuctionStatusUpdaterService> logger, IServiceProvider serviceProvider)
        {
            _logger = logger;
            _serviceProvider = serviceProvider;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Auction Status Updater Service is starting.");

            await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);

            using var timer = new PeriodicTimer(TimeSpan.FromSeconds(60));

            while (!stoppingToken.IsCancellationRequested && await timer.WaitForNextTickAsync(stoppingToken))
            {
                await ProcessExpiredAuctionsAsync(stoppingToken);
            }

            _logger.LogInformation("Auction Status Updater Service is stopping.");
        }

        private async Task ProcessExpiredAuctionsAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Checking for expired auctions at {Time}", DateTime.UtcNow);

            using (var scope = _serviceProvider.CreateScope())
            {
                try
                {
                    var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();
                    var expiredAuctions = await mediator.Send(
                        new GetExpiredAuctionsQuery(),
                        stoppingToken
                    );

                    if (!expiredAuctions.Any())
                    {
                        _logger.LogInformation("No expired auctions found.");
                        return;
                    }

                    _logger.LogInformation("Found {Count} expired auctions to process.", expiredAuctions.Count);

                    foreach (var auction in expiredAuctions)
                    {
                        if (stoppingToken.IsCancellationRequested)
                            break;

                        _logger.LogInformation("Finalizing auction {ListingId}", auction.Id);

                        var finalizeCommand = new FinalizeExpiredAuctionCommand { ListingId = auction.Id };
                        var result = await mediator.Send(finalizeCommand, stoppingToken);

                        if (!result.IsSuccess)
                        {
                            _logger.LogError("Failed to close auction {ListingId}: {Error}",
                                auction.Id, result.Error.Message);
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "An error occurred while processing expired auctions.");
                }
            }
        }
    }
}
