using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations
{
    public class PriceSuggestionConfiguration : BaseEntityConfiguration<PriceSuggestion>
    {
        public override void Configure(EntityTypeBuilder<PriceSuggestion> builder)
        {
            base.Configure(builder);

            builder.ToTable("PriceSuggestions");

            builder.Property(p => p.SuggestedPrice)
                   .HasPrecision(18, 2)
                   .IsRequired();

            builder.Property(p => p.ConfidenceScore)
                   .HasPrecision(5, 2)
                   .IsRequired();

            builder.Property(p => p.ReasoningJson)
                   .HasColumnType("longtext")
                   .IsRequired();

            builder.HasIndex(p => p.ListingId);
        }
    }
}
