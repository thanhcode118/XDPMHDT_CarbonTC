using Microsoft.EntityFrameworkCore;
using CarbonTC.CarbonLifecycle.Service.Models.Entities;

namespace CarbonTC.CarbonLifecycle.Service.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        // DbSets cho các Entities của bạn
        public DbSet<EVJourney> EVJourneys { get; set; } = null!;
        public DbSet<JourneyBatch> JourneyBatches { get; set; } = null!;
        public DbSet<CarbonCredit> CarbonCredits { get; set; } = null!;
        public DbSet<VerificationRequest> VerificationRequests { get; set; } = null!;
        public DbSet<AuditReport> AuditReports { get; set; } = null!;
        public DbSet<CVAStandard> CVAStandards { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Cấu hình mối quan hệ và ràng buộc bổ sung

            // EVJourney - JourneyBatch (1-n)
            modelBuilder.Entity<EVJourney>()
                .HasOne(j => j.Batch)
                .WithMany(b => b.Journeys)
                .HasForeignKey(j => j.BatchId)
                .IsRequired(false); // BatchId có thể null trước khi được gộp vào một batch

            // JourneyBatch - VerificationRequest (1-n, hoặc 1-1 nếu mỗi batch chỉ có 1 request)
            // Trong trường hợp này, 1 JourneyBatch có thể có nhiều VerificationRequests nếu có nhiều lần submit
            // nhưng thường thì 1 JourneyBatch chỉ có 1 VerificationRequest active tại một thời điểm.
            // Để đơn giản, ta coi là 1 batch có thể có nhiều requests nhưng chỉ 1 request dẫn đến credit được mint.
            modelBuilder.Entity<JourneyBatch>()
                .HasMany(b => b.VerificationRequests)
                .WithOne(vr => vr.JourneyBatch)
                .HasForeignKey(vr => vr.BatchId);

            // VerificationRequest - CarbonCredit (1-n)
            modelBuilder.Entity<VerificationRequest>()
                .HasMany(vr => vr.CarbonCredits)
                .WithOne(cc => cc.VerificationRequest)
                .HasForeignKey(cc => cc.RequestId);

            // VerificationRequest - AuditReport (1-n)
            modelBuilder.Entity<VerificationRequest>()
                .HasMany(vr => vr.AuditReports)
                .WithOne(ar => ar.VerificationRequest)
                .HasForeignKey(ar => ar.RequestId);

            // CVAStandard - VerificationRequest (1-n)
            modelBuilder.Entity<CVAStandard>()
                .HasMany(cs => cs.VerificationRequests)
                .WithOne(vr => vr.CVAStandard)
                .HasForeignKey(vr => vr.StandardId);

            // Đảm bảo CreditSerialNumber là duy nhất
            modelBuilder.Entity<CarbonCredit>()
                .HasIndex(cc => cc.CreditSerialNumber)
                .IsUnique();

            // Đảm bảo RequestId trong CarbonCredit là duy nhất nếu mỗi request chỉ sinh ra 1 credit
            // Nếu 1 request có thể sinh ra nhiều credit, thì bỏ ràng buộc này.
            // Hiện tại, ta đang cấu hình 1 request có thể có nhiều credits, nên không đặt IsUnique ở đây.
            // Nếu bạn muốn 1 VerificationRequest chỉ sinh ra 1 CarbonCredit, có thể đặt unique cho RequestId
            // hoặc cấu hình mối quan hệ 1-1. Tạm thời, tôi giữ 1-n như đã khai báo ở entity.

            // Chuyển đổi Enum sang string để lưu trữ trong DB (giúp dễ đọc hơn)
            modelBuilder.Entity<JourneyBatch>()
                .Property(b => b.Status)
                .HasConversion<string>();

            modelBuilder.Entity<CarbonCredit>()
                .Property(cc => cc.Status)
                .HasConversion<string>();

            modelBuilder.Entity<VerificationRequest>()
                .Property(vr => vr.Status)
                .HasConversion<string>();
        }
    }
}