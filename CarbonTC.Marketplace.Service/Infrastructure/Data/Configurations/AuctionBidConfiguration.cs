using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations
{
    public class AuctionBidConfiguration : BaseEntityConfiguration<AuctionBid>
    {
        public override void Configure(EntityTypeBuilder<AuctionBid> builder)
        {
            base.Configure(builder);

            builder.ToTable("AuctionBids");

            builder.Property(b => b.BidAmount)
                   .HasColumnType("decimal(18, 2)");

            builder.Property(b => b.Status)
                   .HasConversion<int>();

            builder.HasIndex(x => x.ListingId);
            builder.HasIndex(x => x.BidderId);
        }
    }
}
