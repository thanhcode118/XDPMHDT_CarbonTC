using Application.Common.Features.Listings.Commands.WarmUpUserBalance;
using MediatR;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using System.Security.Claims;

namespace Infrastructure.SignalR.Hubs
{
    public class AuctionHub : Hub
    {
        private readonly ILogger<AuctionHub> _logger;
        private readonly IMediator _mediator;

        public AuctionHub(ILogger<AuctionHub> logger, IMediator mediator)
        {
            _logger = logger;
            _mediator = mediator;
        }

        public override async Task OnConnectedAsync()
        {
            var claims = Context.User?.Claims?.Select(c => $"{c.Type} = {c.Value}") ?? new List<string>();
            _logger.LogWarning("Client connected. Claims: {Claims}", string.Join(", ", claims));

            var userId = Context.User?.FindFirst("userId")?.Value
                         ?? Context.User?.FindFirst("sub")?.Value
                         ?? Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            _logger.LogWarning("Client OnConnectedAsync. UserId found: {UserId}", userId);

            if (!string.IsNullOrEmpty(userId))
            {
                _logger.LogWarning("Adding user {UserId} to group", userId);
                await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId}");
            }

            await base.OnConnectedAsync();
        }


        public async Task JoinAuction(Guid listingId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"auction_{listingId}");

            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (userId is null)
            {
                _logger.LogWarning("Anonymous user joined auction {ListingId}", listingId);
                return;
            }
            await _mediator.Send(new WarmUpUserBalanceCommand(Guid.Parse(userId)));
        }

        public async Task LeaveAuction(Guid listingId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"auction_{listingId}");
        }

    }
}
