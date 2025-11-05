using Microsoft.EntityFrameworkCore;
using CarbonTC.CarbonLifecycle.Domain.Entities;
using CarbonTC.CarbonLifecycle.Domain.Enums;
using System;
using System.Collections.Generic;

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

            // 1. Cấu hình CVAStandard
            modelBuilder.Entity<CVAStandard>(entity =>
            {
                entity.UsePropertyAccessMode(PropertyAccessMode.Field);
                entity.Property(c => c.ConversionRate).HasColumnType("decimal(18,4)");
                entity.Property(c => c.MinDistanceRequirement).HasColumnType("decimal(18,4)");
            });

            // 2. Cấu hình JourneyBatch
            modelBuilder.Entity<JourneyBatch>(entity =>
            {
                entity.UsePropertyAccessMode(PropertyAccessMode.Field);
                entity.Property(jb => jb.TotalDistanceKm).HasColumnType("decimal(18,4)");
                entity.Property(jb => jb.TotalCO2SavedKg).HasColumnType("decimal(18,4)");
            });

            // 3. Cấu hình EVJourney
            modelBuilder.Entity<EVJourney>(entity =>
            {
                entity.UsePropertyAccessMode(PropertyAccessMode.Field);
                entity.Property(j => j.DistanceKm).HasColumnType("decimal(18,4)");
                entity.Property(j => j.CO2EstimateKg).HasColumnType("decimal(18,4)");

                // Quan hệ JourneyBatch
                entity.HasOne(j => j.JourneyBatch)
                    .WithMany(jb => jb.EVJourneys)
                    .HasForeignKey(j => j.JourneyBatchId);

            });

            // 4. Cấu hình VerificationRequest 
            modelBuilder.Entity<VerificationRequest>(entity =>
            {
                entity.UsePropertyAccessMode(PropertyAccessMode.Field);

                // Quan hệ JourneyBatch
                entity.HasOne(vr => vr.JourneyBatch)
                    .WithMany(jb => jb.VerificationRequests)
                    .HasForeignKey(vr => vr.JourneyBatchId);

                // Quan hệ CVAStandard
                entity.HasOne(vr => vr.CvaStandard)
                    .WithMany(cs => cs.VerificationRequests)
                    .HasForeignKey(vr => vr.CvaStandardId)
                    .OnDelete(DeleteBehavior.SetNull);

            });

            // 5. Cấu hình CarbonCredit
            modelBuilder.Entity<CarbonCredit>(entity =>
            {
                entity.UsePropertyAccessMode(PropertyAccessMode.Field);

                // Quan hệ JourneyBatch
                entity.HasOne(cc => cc.JourneyBatch)
                    .WithMany(jb => jb.CarbonCredits)
                    .HasForeignKey(cc => cc.JourneyBatchId);

                // Quan hệ VerificationRequest 
                entity.HasOne(cc => cc.VerificationRequest)
                    .WithMany(vr => vr.CarbonCredits)
                    .HasForeignKey(cc => cc.VerificationRequestId)
                    .OnDelete(DeleteBehavior.SetNull);

            });

            // 6. Cấu hình AuditReport
            modelBuilder.Entity<AuditReport>(entity =>
            {
                entity.UsePropertyAccessMode(PropertyAccessMode.Field);
            });
        }
    }
}