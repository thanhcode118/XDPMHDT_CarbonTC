namespace Domain.Exceptions
{
    public class ListingNotFoundException : DomainException
    {
        public Guid ListingId { get; }

        public ListingNotFoundException(Guid listingId)
            : base($"Listing with ID {listingId} not found")
        {
            ListingId = listingId;
        }
    }
}
