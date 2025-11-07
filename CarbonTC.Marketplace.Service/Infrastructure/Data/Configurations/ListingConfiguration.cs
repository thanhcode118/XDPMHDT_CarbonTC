using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations
{
    public class ListingConfiguration : BaseEntityConfiguration<Listing>
    {
        public override void Configure(EntityTypeBuilder<Listing> builder)
        {
            base.Configure(builder);

            builder.ToTable("Listings");

            builder.Property(l => l.PricePerUnit)
                   .HasPrecision(18, 2)
                   .IsRequired();

            builder.Property(l => l.Type)
                   .HasConversion<int>();

            builder.Property(l => l.Status)
                   .HasConversion<int>();

            builder.Property(x => x.Quantity)
                   .HasPrecision(18, 2)
                   .IsRequired();

            builder.HasMany(l => l.Bids)
                .WithOne()
                .HasForeignKey("ListingId")
                .OnDelete(DeleteBehavior.Cascade);

            builder.Navigation(nameof(Listing.Bids)).UsePropertyAccessMode(PropertyAccessMode.Field);

            builder.HasOne(l => l.PriceSuggestion)
                .WithOne()
                .HasForeignKey<PriceSuggestion>(p => p.ListingId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Navigation(nameof(Listing.PriceSuggestion)).UsePropertyAccessMode(PropertyAccessMode.Field);

            builder.HasIndex("CreditId");
            builder.HasIndex("OwnerId");
        }
    }
}
