using Domain.Common;
using Domain.Enum;
using Domain.Exceptions;

namespace Domain.Entities
{
    public class AuctionBid: BaseEntity
    {
        public Guid ListingId { get; private set; }
        public Guid BidderId { get; private set; }
        public decimal BidAmount { get; private set; }
        public DateTime BidTime { get; private set; }
        public BidStatus Status { get; private set; }

        private AuctionBid() {}

        private AuctionBid(Guid listingId, Guid bidderId, decimal bidAmount)
        {
            ListingId = listingId;
            BidderId = bidderId;
            BidAmount = bidAmount;
            BidTime = DateTime.UtcNow;
            Status = BidStatus.Winning;
        }

        public static AuctionBid Create(Guid listingId, Guid bidderId, decimal bidAmount)
        {
            if (bidAmount <= 0)
                throw new DomainException("Bid amount must be greater than zero");

            return new AuctionBid(listingId, bidderId, bidAmount);
        }

        public void MarkAsOutbid()
        {
            if (Status != BidStatus.Winning)
                throw new DomainException("Can only outbid winning bids");

            Status = BidStatus.Outbid;
        }

        public void Cancel()
        {
            if (Status == BidStatus.Cancelled)
                throw new DomainException("Bid is already cancelled");

            Status = BidStatus.Cancelled;
        }

        public void MarkAsPending()
        {
            Status = BidStatus.Pending;
        }

    }
}
