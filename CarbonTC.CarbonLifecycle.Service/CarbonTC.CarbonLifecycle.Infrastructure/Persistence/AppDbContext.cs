using Microsoft.EntityFrameworkCore;
using CarbonTC.CarbonLifecycle.Domain.Entities;
using CarbonTC.CarbonLifecycle.Domain.Enums; 
using System; 

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
            // Cấu hình có sẵn của bạn
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<EVJourney>()
                .Property(j => j.DistanceKm)
                .HasColumnType("decimal(18,4)");

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


            modelBuilder.Entity<VerificationRequest>()
                .HasOne(vr => vr.JourneyBatch)
                .WithMany(jb => jb.VerificationRequests)
                .HasForeignKey(vr => vr.JourneyBatchId);


            //  Cấu hình VerificationRequest <-> CVAStandard 
            modelBuilder.Entity<VerificationRequest>()
                .HasOne(vr => vr.CvaStandard) // Một VerificationRequest có 1 CvaStandard
                .WithMany(cs => cs.VerificationRequests) // Một CvaStandard được dùng cho nhiều VerificationRequest
                .HasForeignKey(vr => vr.CvaStandardId) // Khoá ngoại là CvaStandardId
                .OnDelete(DeleteBehavior.SetNull); // Nếu xoá Standard, chỉ set CvaStandardId = null

            //  Cấu hình CarbonCredit <-> VerificationRequest 
            modelBuilder.Entity<CarbonCredit>()
                .HasOne(cc => cc.VerificationRequest) // Một CarbonCredit đến từ 1 VerificationRequest
                .WithMany(vr => vr.CarbonCredits) // Một VerificationRequest có thể tạo ra nhiều CarbonCredit
                .HasForeignKey(cc => cc.VerificationRequestId) // Khoá ngoại là VerificationRequestId
                .OnDelete(DeleteBehavior.SetNull); // Nếu xoá Request, chỉ set VerificationRequestId = null

            // ==========================================
            // ===== BẮT ĐẦU DỮ LIỆU SEED (IMPORT) =====
            // ==========================================

            // --- 1. Hằng số ---
            var demoUserId = "auth0|demo-user-12345";
            var seedTime = new DateTime(2025, 10, 23, 0, 0, 0, DateTimeKind.Utc);

            // --- 2. Tạo các ID cố định ---
            var standardVFe34Id = Guid.Parse("d2a0a0f0-a3b0-4b10-8b7a-0a0a0a0a0a01");
            var standardTeslaYId = Guid.Parse("e1b1b1f1-b4c1-4c21-9c8b-1b1b1b1b1b02");
            var batchId = Guid.Parse("b0b0b0b0-b0b0-4b0b-8b0b-0b0b0b0b0b0b");
            var journey1Id = Guid.Parse("a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d");
            var journey2Id = Guid.Parse("f6e5d4c3-b2a1-4c5d-9e8f-1a2b3c4d5e6f");
            var verificationId = Guid.Parse("12345678-90ab-4cde-8fab-1234567890ab");
            var creditId = Guid.Parse("abcdef12-3456-4abc-9def-abcdef123456");
            var auditId = Guid.Parse("fedcba98-7654-4fed-8cba-fedcba987654");

            // --- 3. Seed Bảng CVAStandards ---
            // (Sửa lỗi: Dùng StandardName, EffectiveDate, EndDate)
            modelBuilder.Entity<CVAStandard>().HasData(
                new CVAStandard
                {
                    Id = standardVFe34Id,
                    StandardName = "TC-Std-VFe34-2024",
                    VehicleType = "Vinfast-VFe34",
                    ConversionRate = 0.12m,
                    MinDistanceRequirement = 1.0m,
                    IsActive = true,
                    EffectiveDate = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc), 
                    EndDate = new DateTime(2025, 12, 31, 0, 0, 0, DateTimeKind.Utc), 
                    CreatedAt = seedTime,
                    LastModifiedAt = seedTime
                },
                new CVAStandard
                {
                    Id = standardTeslaYId,
                    StandardName = "TC-Std-TeslaY-2024",
                    VehicleType = "Tesla-ModelY",
                    ConversionRate = 0.09m,
                    MinDistanceRequirement = 1.0m,
                    IsActive = true,
                    EffectiveDate = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc), 
                    EndDate = new DateTime(2025, 12, 31, 0, 0, 0, DateTimeKind.Utc), 
                    CreatedAt = seedTime,
                    LastModifiedAt = seedTime
                }
            );

            // --- 4. Seed Bảng JourneyBatches ---
            decimal totalCO2 = (85.5m * 0.12m) + (42.0m * 0.09m); // = 14.04m
            modelBuilder.Entity<JourneyBatch>().HasData(
                new JourneyBatch
                {
                    Id = batchId,
                    UserId = demoUserId,
                    Status = JourneyBatchStatus.Verified,
                    NumberOfJourneys = 2,
                    TotalDistanceKm = 127.5m, // (85.5 + 42.0)
                    TotalCO2SavedKg = totalCO2,
                    CreationTime = seedTime,
                    VerificationTime = seedTime,
                    CreatedAt = seedTime,
                    LastModifiedAt = seedTime
                }
            );

            // --- 5. Seed Bảng EVJourneys ---
            // (Sửa lỗi: Dùng JourneyStatus.Verified thay vì .Batched)
            modelBuilder.Entity<EVJourney>().HasData(
                new EVJourney
                {
                    Id = journey1Id,
                    UserId = demoUserId,
                    JourneyBatchId = batchId,
                    StartTime = new DateTime(2025, 10, 20, 8, 0, 0, DateTimeKind.Utc),
                    EndTime = new DateTime(2025, 10, 20, 9, 15, 0, DateTimeKind.Utc),
                    DistanceKm = 85.5m,
                    VehicleType = "Vinfast-VFe34",
                    CO2EstimateKg = 85.5m * 0.12m,
                    Status = JourneyStatus.Verified, 
                    Origin = "N/A",
                    Destination = "N/A",
                    CreatedAt = seedTime,
                    LastModifiedAt = seedTime
                },
                new EVJourney
                {
                    Id = journey2Id,
                    UserId = demoUserId,
                    JourneyBatchId = batchId,
                    StartTime = new DateTime(2025, 10, 21, 14, 0, 0, DateTimeKind.Utc),
                    EndTime = new DateTime(2025, 10, 21, 15, 0, 0, DateTimeKind.Utc),
                    DistanceKm = 42.0m,
                    VehicleType = "Tesla-ModelY",
                    CO2EstimateKg = 42.0m * 0.09m,
                    Status = JourneyStatus.Verified, 
                    Origin = "N/A",
                    Destination = "N/A",
                    CreatedAt = seedTime,
                    LastModifiedAt = seedTime
                }
            );

            // --- 6. Seed Bảng VerificationRequests ---
            // (Sửa lỗi: Dùng RequestorId, VerifierId, RequestDate, VerificationDate)
            modelBuilder.Entity<VerificationRequest>().HasData(
                new VerificationRequest
                {
                    Id = verificationId,
                    JourneyBatchId = batchId,
                    RequestorId = demoUserId, 
                    VerifierId = "system-seed", 
                    RequestDate = seedTime, 
                    VerificationDate = seedTime, 
                    Status = VerificationRequestStatus.Approved,
                    Notes = "Seed data - automatically approved.",
                    CreatedAt = seedTime,
                    LastModifiedAt = seedTime,
                    CvaStandardId = standardVFe34Id 
                }
            );

            // --- 7. Seed Bảng CarbonCredits ---
            // (Sửa lỗi: Dùng UserId, AmountKgCO2e, IssueDate)
            modelBuilder.Entity<CarbonCredit>().HasData(
                new CarbonCredit
                {
                    Id = creditId,
                    JourneyBatchId = batchId,
                    UserId = demoUserId, // Sửa lỗi
                    AmountKgCO2e = totalCO2, // Sửa lỗi
                    IssueDate = seedTime, // Sửa lỗi
                    Status = CarbonCreditStatus.Issued,
                    ExpiryDate = null,
                    TransactionHash = "0xabc123def4567890",
                    CreatedAt = seedTime,
                    LastModifiedAt = seedTime,
                    VerificationRequestId = verificationId 
                }
            );

            // --- 8. Seed Bảng AuditReports ---
            // (Sửa lỗi: Dùng EntityId (Guid), OriginalValues và bỏ AffectedFields)
            modelBuilder.Entity<AuditReport>().HasData(
                new AuditReport
                {
                    Id = auditId,
                    EntityId = batchId, // Sửa lỗi: Phải là Guid
                    EntityType = "JourneyBatch",
                    Action = "Seed",
                    ChangedBy = "system-seed",
                    ChangeDate = seedTime,
                    OriginalValues = "{}", // Sửa lỗi
                    NewValues = "{'Status':'Verified'}",
                    CreatedAt = seedTime,
                    LastModifiedAt = seedTime
                }
            );

            // ==========================================
            // ===== KẾT THÚC DỮ LIỆU SEED (IMPORT) =====
            // ==========================================
        }
    }
}