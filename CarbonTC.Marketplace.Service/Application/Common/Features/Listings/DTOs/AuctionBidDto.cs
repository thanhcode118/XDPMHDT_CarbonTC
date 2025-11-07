namespace Application.Common.Features.Listings.DTOs
{
    public class AuctionBidDto
    {
        public Guid ListingId { get; init; }
        public Guid BidderId { get; init; }
        public decimal BidAmount { get; init; }
        public DateTime BidTime { get; init; }
    }
}
