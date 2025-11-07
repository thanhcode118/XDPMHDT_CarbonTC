using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations
{
    public class TransactionsConfiguration : BaseEntityConfiguration<Transactions>
    {
        public override void Configure(EntityTypeBuilder<Transactions> builder)
        {
            base.Configure(builder);

            builder.ToTable("Transactions");

            builder.Property(t => t.Quantity).HasPrecision(18, 2);
            builder.Property(t => t.TotalAmount).HasPrecision(18, 2);
            builder.Property(t => t.Status).HasConversion<int>();

            builder.HasIndex(t => t.ListingId);
            builder.HasIndex(t => t.BuyerId);
            builder.HasIndex(t => t.SellerId);
        }
    }
}
