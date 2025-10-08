using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations
{
    public class PriceSuggestionConfiguration : IEntityTypeConfiguration<PriceSuggestion>
    {
        public void Configure(EntityTypeBuilder<PriceSuggestion> builder)
        {
            builder.ToTable("PriceSuggestions");
            builder.HasKey(ps => ps.Id);

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
