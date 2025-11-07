namespace Application.Common.DTOs
{
    public class AuctionBidResponse
    {
        public Guid BidId { get; set; }
        public Guid ListingId { get; set; }
        public Guid BidderId { get; set; }
        public decimal BidAmount { get; set; }
        public DateTime BidTime { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }
}
