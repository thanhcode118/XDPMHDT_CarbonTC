using Domain.Common;
using Domain.Enum;
using Domain.Events.Listing;
using Domain.Events.AuctionBid;
using Domain.Exceptions;

namespace Domain.Entities
{
    public class Listing: BaseEntity, AggregateRoot
    {
        public Guid CreditId { get; private set; }
        public Guid OwnerId { get; private set; }
        public ListingType Type { get; private set; }
        public decimal PricePerUnit { get; private set; }
        public decimal Quantity { get; private set; }
        public ListingStatus Status { get; private set; }
        public DateTime? ClosedAt { get; private set; }
        public decimal? MinimumBid { get; private set; }
        public DateTime? AuctionEndTime { get; private set; }


        private readonly List<AuctionBid> _bids = new();
        public IReadOnlyCollection<AuctionBid> Bids => _bids.AsReadOnly();

        private PriceSuggestion? _priceSuggestion;
        public PriceSuggestion? PriceSuggestion => _priceSuggestion;


        private Listing() {}

        private Listing(Guid creditId,
            Guid ownerId,
            ListingType type,
            decimal pricePerUnit,
            decimal quantity,
            decimal? minimumBid = null,
            DateTime? auctionEndTime = null)
        {
            Id = Guid.NewGuid();
            CreditId = creditId;
            OwnerId = ownerId;
            Type = type;
            PricePerUnit = pricePerUnit;
            Quantity = quantity;
            Status = ListingStatus.Open;
            CreatedAt = DateTime.UtcNow;
            MinimumBid = minimumBid;
            AuctionEndTime = auctionEndTime;

            ValidateListing();
        }

        public static Listing CreateFixedPriceListing(
            Guid creditId,
            Guid ownerId,
            decimal pricePerUnit,
            decimal quantity)
        {
            if (pricePerUnit <= 0)
                throw new DomainException("Price per unit must be greater than zero");

            return new Listing(creditId, ownerId, ListingType.FixedPrice, pricePerUnit, quantity);
        }

        public static Listing CreateAuctionListing(
            Guid creditId,
            Guid ownerId,
            decimal startingPrice,
            decimal minimumBid,
            decimal quantity,
            DateTime auctionEndTime)
        {
            if (auctionEndTime <= DateTime.UtcNow)
                throw new DomainException("Auction end time must be in the future");

            if (minimumBid <= 0)
                throw new DomainException("Minimum bid must be greater than zero");

            return new Listing(
                creditId,
                ownerId,
                ListingType.Auction,
                startingPrice,
                quantity,
                minimumBid,
                auctionEndTime);
        }

        public void UpdatePrice(decimal newPrice)
        {
            if (Status != ListingStatus.Open)
                throw new DomainException("Cannot update price for non-open listing");

            if (Type == ListingType.Auction)
                throw new DomainException("Cannot update price for auction listing");

            if (newPrice <= 0)
                throw new DomainException("Price must be greater than zero");

            PricePerUnit = newPrice;
            AddDomainEvent(new ListingPriceUpdatedDomainEvent(Id, newPrice));
        }

        public void Cancel()
        {
            if (Status != ListingStatus.Open)
                throw new DomainException("Only open listings can be cancelled");

            if (Type == ListingType.Auction && _bids.Any(b => b.Status == BidStatus.Winning))
                throw new DomainException("Cannot cancel auction with active bids");

            Status = ListingStatus.Cancelled;
            ClosedAt = DateTime.UtcNow;

            AddDomainEvent(new ListingCancelledDomainEvent(Id, OwnerId, CreditId));
        }

        public void Close()
        {
            if (Status != ListingStatus.Open)
                throw new DomainException("Only open listings can be closed");

            Status = ListingStatus.Closed;
            ClosedAt = DateTime.UtcNow;

            AddDomainEvent(new ListingClosedDomainEvent(Id));
        }

        public void MarkAsSold()
        {
            if (Status != ListingStatus.Open)
                throw new DomainException("Only open listings can be marked as sold");

            Status = ListingStatus.Sold;
            ClosedAt = DateTime.UtcNow;

            AddDomainEvent(new ListingSoldDomainEvent(Id, OwnerId, CreditId));
        }

        public AuctionBid PlaceBid(Guid bidderId, decimal bidAmount)
        {
            if (Type != ListingType.Auction)
                throw new DomainException("Can only place bids on auction listings");

            if (Status != ListingStatus.Open)
                throw new DomainException("Listing is not open for bidding");

            if (DateTime.UtcNow >= AuctionEndTime)
                throw new DomainException("Auction has ended");

            if (bidAmount < MinimumBid)
                throw new DomainException($"Bid amount must be at least {MinimumBid}");

            var currentHighestBid = _bids
                .Where(b => b.Status == BidStatus.Winning)
                .OrderByDescending(b => b.BidAmount)
                .FirstOrDefault();

            if (currentHighestBid != null && bidAmount <= currentHighestBid.BidAmount)
                throw new DomainException("Bid must be higher than current highest bid");

            if (currentHighestBid?.BidderId == bidderId)
                throw new DomainException("You are already the highest bidder");

            // Outbid previous winner
            if (currentHighestBid != null)
            {
                currentHighestBid.MarkAsOutbid();
            }

            var newBid = AuctionBid.Create(Id, bidderId, bidAmount);
            _bids.Add(newBid);

            AddDomainEvent(new BidPlacedDomainEvent(Id, bidderId, bidAmount, newBid.BidTime, currentHighestBid.BidderId));

            return newBid;
        }

        public void BuyNow(Guid buyerId, decimal amountToBuy)
        {
            if (Type != ListingType.FixedPrice)
                throw new DomainException("Can only buy fixed price listings.");

            if (Status != ListingStatus.Open)
                throw new DomainException("Listing is not open for purchase");

            if (amountToBuy <= 0)
                throw new DomainException("Amount to buy must be greater than zero.");

            if (amountToBuy > Quantity) 
                throw new DomainException($"Insufficient quantity. This listing only has {Quantity} available.");

            var totalPrice = PricePerUnit * amountToBuy;

            Quantity -= amountToBuy; 

            if (Quantity == 0)
            {
                Status = ListingStatus.Sold;
                ClosedAt = DateTime.UtcNow;
            }

            AddDomainEvent(new ListingPurchasedDomainEvent(Id, CreditId, buyerId, OwnerId, amountToBuy, totalPrice));
        }


        public AuctionBid? GetWinningBid()
        {
            return _bids
                .Where(b => b.Status == BidStatus.Winning)
                .OrderByDescending(b => b.BidAmount)
                .FirstOrDefault();
        }

        public void CompleteAuction()
        {
            if (Type != ListingType.Auction)
                throw new DomainException("Only auction listings can be completed");

            if(Status != ListingStatus.Open)
                throw new DomainException("Only open auctions can be completed");

            Status = ListingStatus.Closed;

            var winningBid = GetWinningBid();
            ClosedAt = DateTime.UtcNow;

            if (winningBid == null)
            {
                Status = ListingStatus.Closed;
                AddDomainEvent(new AuctionCompletedWithoutBidsDomainEvent(Id, OwnerId));
            }
            else
            {
                Status = ListingStatus.Sold;
                AddDomainEvent(new AuctionCompletedDomainEvent(Id, CreditId, winningBid.BidderId, OwnerId, Quantity , winningBid.BidAmount));
            }
        }

        public void UpdateStatus(ListingStatus newStatus)
        {
            if (Status != newStatus)
            {
                Status = newStatus;
                UpdatedAt = DateTime.UtcNow;

                if (newStatus == ListingStatus.Closed || newStatus == ListingStatus.Sold)
                {
                    ClosedAt = DateTime.UtcNow;
                }
            }
        }

        public void UpdateClosedAt(DateTime? closedAt)
        {
            ClosedAt = closedAt;
            UpdatedAt = DateTime.UtcNow;
        }

        public void UpdateFixedPrice(decimal pricePerUnit)
        {
            if (Type != ListingType.FixedPrice)
                throw new DomainException("Cannot set fixed price for non-fixed price listing");

            PricePerUnit = pricePerUnit;
            MinimumBid = null;
            AuctionEndTime = null;
            UpdatedAt = DateTime.UtcNow;
        }
       
        public void UpdateType(ListingType newType)
        {
            if (Type != newType)
            {
                Type = newType;
                UpdatedAt = DateTime.UtcNow;
            }
        }

        public void UpdateAuctionDetails(decimal minimumBid, DateTime auctionEndTime)
        {
            if (Type != ListingType.Auction)
                throw new DomainException("Cannot set auction details for non-auction listing");

            MinimumBid = minimumBid;
            AuctionEndTime = auctionEndTime;
            UpdatedAt = DateTime.UtcNow;
        }

        public bool HasBids()
        {
            return _bids.Any();
        }

        private void ValidateListing()
        {
            if (Type == ListingType.Auction)
            {
                if (!AuctionEndTime.HasValue || !MinimumBid.HasValue)
                    throw new DomainException("Auction listings must have end time and minimum bid");
            }
            if(Quantity <= 0)
            {
                throw new DomainException("Quantity must be greater than zero");
            }
        }
    }
}
