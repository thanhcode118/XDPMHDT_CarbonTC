namespace Domain.Exceptions
{
    public class AuctionExpiredException : DomainException
    {
        public Guid ListingId { get; }

        public AuctionExpiredException(Guid listingId)
            : base($"Auction for listing {listingId} has expired")
        {
            ListingId = listingId;
        }
    }
}
