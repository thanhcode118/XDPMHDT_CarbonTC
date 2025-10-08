using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations
{
    public class AuctionBidConfiguration : IEntityTypeConfiguration<AuctionBid>
    {
        public void Configure(EntityTypeBuilder<AuctionBid> builder)
        {
            builder.ToTable("AuctionBids");

            builder.HasKey(ab => ab.Id);

            builder.Property(b => b.BidAmount)
                   .HasColumnType("decimal(18, 2)");

            builder.Property(b => b.Status)
                   .HasConversion<int>();

            builder.HasIndex(x => x.ListingId);
            builder.HasIndex(x => x.BidderId);
        }
    }
}
