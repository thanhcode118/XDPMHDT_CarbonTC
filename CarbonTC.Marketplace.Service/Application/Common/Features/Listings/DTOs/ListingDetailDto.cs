using Domain.Entities;
using Domain.Enum;

namespace Application.Common.Features.Listings.DTOs
{
    public class ListingDetailDto
    {
        public Guid Id { get; init; }
        public Guid CreditId { get; init; }
        public Guid OwnerId { get; init; }
        public ListingType Type { get; init; }
        public decimal PricePerUnit { get; init; }
        public ListingStatus Status { get; init; }
        public DateTime CreatedAt { get; init; }
        public DateTime? ClosedAt { get; init; }
        public decimal? MinimumBid { get; init; }
        public DateTime? AuctionEndTime { get; init; }


        public IEnumerable<AuctionBid> AuctionBids { get; init; }
        public IEnumerable<Transactions> Transactions { get; init; }
        public decimal? SuggestedPrice { get; init; }
    }
}
