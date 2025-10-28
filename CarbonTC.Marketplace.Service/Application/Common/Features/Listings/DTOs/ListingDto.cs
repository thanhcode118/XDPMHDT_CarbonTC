using Domain.Enum;

namespace Application.Common.Features.Listings.DTOs
{
    public class ListingDto
    {
        public Guid Id { get; init; }
        public Guid CreditId { get; init; }
        public Guid OwnerId { get; init; }
        public ListingType Type { get; init; }
        public decimal PricePerUnit { get; init; }
        public decimal Quantity { get; init; }
        public ListingStatus Status { get; init; }
        public DateTime CreatedAt { get; init; }
        public DateTime? ClosedAt { get; init; }
        public decimal? MinimumBid { get; init; }
        public DateTime? AuctionEndTime { get; init; }
    }
}
