using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations
{
    public class CreditInventoryConfiguration : IEntityTypeConfiguration<CreditInventory>
    {
        public void Configure(EntityTypeBuilder<CreditInventory> builder)
        {
            builder.ToTable("CreditInventories");

            builder.HasKey(ci => ci.Id);

            builder.Property(c => c.TotalAmount).HasPrecision(18, 2);
            builder.Property(c => c.AvailableAmount).HasPrecision(18, 2);
            builder.Property(c => c.ListedAmount).HasPrecision(18, 2);
            builder.Property(c => c.LockedAmount).HasPrecision(18, 2);

            builder.HasIndex(ci => ci.CreditId);
        }
    }
}
