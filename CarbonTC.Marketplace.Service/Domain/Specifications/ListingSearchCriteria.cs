using Domain.Entities;
using Domain.Enum;

namespace Domain.Specifications
{
    public record ListingSearchCriteria
    {
        public ListingType? Type { get; init; }
        public ListingStatus? Status { get; init; }
        public decimal? MinPrice { get; init; }
        public decimal? MaxPrice { get; init; }
        public Guid? OwnerId { get; init; }
        public Guid? CreditId { get; init; }
        public DateTime? CreatedAfter { get; init; }
        public DateTime? CreatedBefore { get; init; }
        public bool? IsAuctionActive { get; init; }
        public int PageNumber { get; init; } = 1;
        public int PageSize { get; init; } = 20;
        public string? SortBy { get; init; } = "CreatedAt";
        public bool SortDescending { get; init; } = true;
    }

    public static class ListingSpecifications
    {
        public static bool IsOpen(Listing listing)
        {
            return listing.Status == ListingStatus.Open;
        }

        public static bool IsAuctionActive(Listing listing)
        {
            return listing.Type == ListingType.Auction
                && listing.Status == ListingStatus.Open
                && listing.AuctionEndTime.HasValue
                && listing.AuctionEndTime.Value > DateTime.UtcNow;
        }

        public static bool IsAuctionExpired(Listing listing)
        {
            return listing.Type == ListingType.Auction
                && listing.Status == ListingStatus.Open
                && listing.AuctionEndTime.HasValue
                && listing.AuctionEndTime.Value <= DateTime.UtcNow;
        }

        public static bool CanBeCancelled(Listing listing)
        {
            if (listing.Status != ListingStatus.Open)
                return false;

            if (listing.Type == ListingType.Auction)
            {
                var hasActiveBids = listing.Bids.Any(b => b.Status == BidStatus.Winning);
                return !hasActiveBids;
            }

            return true;
        }

        public static bool CanAcceptBids(Listing listing)
        {
            return listing.Type == ListingType.Auction
                && listing.Status == ListingStatus.Open
                && listing.AuctionEndTime.HasValue
                && listing.AuctionEndTime.Value > DateTime.UtcNow;
        }

    }
}
