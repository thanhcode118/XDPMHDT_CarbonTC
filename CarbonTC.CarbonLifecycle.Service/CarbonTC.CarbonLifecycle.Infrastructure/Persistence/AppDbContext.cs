using Microsoft.EntityFrameworkCore;
using CarbonTC.CarbonLifecycle.Domain.Entities;

namespace CarbonTC.CarbonLifecycle.Infrastructure.Persistence
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        // Define DbSets for your entities
        public DbSet<EVJourney> EVJourneys { get; set; }
        public DbSet<JourneyBatch> JourneyBatches { get; set; }
        public DbSet<CarbonCredit> CarbonCredits { get; set; }
        public DbSet<VerificationRequest> VerificationRequests { get; set; }
        public DbSet<AuditReport> AuditReports { get; set; }
        public DbSet<CVAStandard> CVAStandards { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure decimal precision and scale for MySQL
            modelBuilder.Entity<EVJourney>()
                .Property(j => j.DistanceKm)
                .HasColumnType("decimal(18,4)"); // Ví dụ: 18 chữ số tổng cộng, 4 chữ số sau dấu thập phân

            modelBuilder.Entity<EVJourney>()
                .Property(j => j.CO2EstimateKg)
                .HasColumnType("decimal(18,4)");

            modelBuilder.Entity<JourneyBatch>()
                .Property(jb => jb.TotalDistanceKm)
                .HasColumnType("decimal(18,4)");

            modelBuilder.Entity<JourneyBatch>()
                .Property(jb => jb.TotalCO2SavedKg)
                .HasColumnType("decimal(18,4)");

            modelBuilder.Entity<CVAStandard>()
                .Property(c => c.ConversionRate)
                .HasColumnType("decimal(18,4)");

            modelBuilder.Entity<CVAStandard>()
                .Property(c => c.MinDistanceRequirement)
                .HasColumnType("decimal(18,4)");

            // Configure relationships if any (e.g., one-to-many between JourneyBatch and EVJourney)
            modelBuilder.Entity<EVJourney>()
                .HasOne(j => j.JourneyBatch)
                .WithMany(jb => jb.EVJourneys)
                .HasForeignKey(j => j.JourneyBatchId);

            modelBuilder.Entity<CarbonCredit>()
                .HasOne(cc => cc.JourneyBatch)
                .WithMany(jb => jb.CarbonCredits)
                .HasForeignKey(cc => cc.JourneyBatchId);

            modelBuilder.Entity<VerificationRequest>()
                .HasOne(vr => vr.JourneyBatch)
                .WithMany(jb => jb.VerificationRequests)
                .HasForeignKey(vr => vr.JourneyBatchId);
        }
    }
}
