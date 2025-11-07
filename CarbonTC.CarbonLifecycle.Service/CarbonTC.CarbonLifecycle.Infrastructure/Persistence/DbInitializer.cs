using Microsoft.EntityFrameworkCore;
using CarbonTC.CarbonLifecycle.Domain.Entities;
using CarbonTC.CarbonLifecycle.Domain.Enums;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace CarbonTC.CarbonLifecycle.Infrastructure.Persistence
{
    public static class DbInitializer
    {
        public static async Task Initialize(AppDbContext context)
        {
            // 1. Áp dụng các Migration (nếu cần)
            await context.Database.MigrateAsync();

            // 2. Kiểm tra nếu đã có dữ liệu Standards, thì không seed lại
            if (context.CVAStandards.Any())
            {
                return;   // Đã có dữ liệu, thoát khỏi quá trình seed
            }

            // ==========================================
            // ===== HẰNG SỐ VÀ KHỞI TẠO ID CỐ ĐỊNH =====
            // ==========================================
            var demoUserId = "auth0|demo-user-12345";
            var seedTime = new DateTime(2025, 10, 23, 0, 0, 0, DateTimeKind.Utc);

            // CHÚ Ý: KHÔNG DÙNG Guid.NewGuid() NẾU BẠN MUỐN ID CỐ ĐỊNH GIỮA CÁC LẦN CHẠY!
            // Chúng ta sẽ dùng Factory Methods, nhưng vẫn cần ID cố định để tạo liên kết trong quá trình Seed.

            // --- TẠO DỮ LIỆU CVAStandards ---
            var standardVFe34 = CVAStandard.Create(
                "VERRA",
                "Vinfast-VFe34",
                0.12m,
                1.0m,
                new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                new DateTime(2025, 12, 31, 0, 0, 0, DateTimeKind.Utc),
                true
            );
            // Dùng Reflection hoặc Setter/Constructor đặc biệt để gán ID cố định cho quá trình Seed
            // Thay vì dùng Reflection, tôi sẽ gán ID cố định cho tiện (vì bạn đã mở private constructor)
            var cvaStandardType = typeof(CVAStandard);
            var idProperty = cvaStandardType.GetProperty("Id");
            idProperty?.SetValue(standardVFe34, Guid.Parse("d2a0a0f0-a3b0-4b10-8b7a-0a0a0a0a0a01")); // ID cố định

            var standardTeslaY = CVAStandard.Create(
                "GoldStandard",
                "Tesla-ModelY",
                0.09m,
                1.0m,
                new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                new DateTime(2025, 12, 31, 0, 0, 0, DateTimeKind.Utc),
                true
            );
            idProperty?.SetValue(standardTeslaY, Guid.Parse("e1b1b1f1-b4c1-4c21-9c8b-1b1b1b1b1b02")); // ID cố định

            var cvaStandards = new CVAStandard[] { standardVFe34, standardTeslaY };
            context.CVAStandards.AddRange(cvaStandards);


            // --- TẠO DỮ LIỆU JOURNEY BATCH ---
            var journeyBatch = JourneyBatch.Create(demoUserId);
            var journeyBatchIdProperty = typeof(JourneyBatch).GetProperty("Id");
            journeyBatchIdProperty?.SetValue(journeyBatch, Guid.Parse("b0b0b0b0-b0b0-4b0b-8b0b-0b0b0b0b0b0b")); // ID cố định

            // Cần khởi tạo thêm các thuộc tính mà Factory Methods không tạo
            var statusProperty = typeof(JourneyBatch).GetProperty("Status");
            statusProperty?.SetValue(journeyBatch, JourneyBatchStatus.Verified);
            var verificationTimeProperty = typeof(JourneyBatch).GetProperty("VerificationTime");
            verificationTimeProperty?.SetValue(journeyBatch, seedTime);


            // --- TẠO DỮ LIỆU EV JOURNEYS ---
            var journey1 = EVJourney.Create(
                journeyBatch.Id,
                demoUserId,
                85.5m,
                new DateTime(2025, 10, 20, 8, 0, 0, DateTimeKind.Utc),
                new DateTime(2025, 10, 20, 9, 15, 0, DateTimeKind.Utc),
                "Vinfast-VFe34",
                "N/A",
                "N/A",
                85.5m * 0.12m
            );
            var j1IdProperty = typeof(EVJourney).GetProperty("Id");
            j1IdProperty?.SetValue(journey1, Guid.Parse("a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d")); // ID cố định

            var journey2 = EVJourney.Create(
                journeyBatch.Id,
                demoUserId,
                42.0m,
                new DateTime(2025, 10, 21, 14, 0, 0, DateTimeKind.Utc),
                new DateTime(2025, 10, 21, 15, 0, 0, DateTimeKind.Utc),
                "Tesla-ModelY",
                "N/A",
                "N/A",
                42.0m * 0.09m
            );
            var j2IdProperty = typeof(EVJourney).GetProperty("Id");
            j2IdProperty?.SetValue(journey2, Guid.Parse("f6e5d4c3-b2a1-4c5d-9e8f-1a2b3c4d5e6f")); // ID cố định

            // Cập nhật tóm tắt Batch bằng Behavior Methods
            journeyBatch.AddJourneySummary(journey1.DistanceKm, journey1.CO2EstimateKg);
            journeyBatch.AddJourneySummary(journey2.DistanceKm, journey2.CO2EstimateKg);

            context.JourneyBatches.Add(journeyBatch);
            context.EVJourneys.AddRange(journey1, journey2);


            // --- TẠO DỮ LIỆU VERIFICATION REQUEST ---
            var verificationRequest = VerificationRequest.Create(
                journeyBatch.Id,
                demoUserId,
                "Seed data - automatically approved."
            );
            var vIdProperty = typeof(VerificationRequest).GetProperty("Id");
            vIdProperty?.SetValue(verificationRequest, Guid.Parse("12345678-90ab-4cde-8fab-1234567890ab")); // ID cố định

            // Áp dụng Behavior Method để đánh dấu đã được phê duyệt
            verificationRequest.MarkAsApproved(
                "system-seed",
                standardVFe34.Id, // ID tiêu chuẩn cố định
                "Seed data - automatically approved."
            );
            context.VerificationRequests.Add(verificationRequest);


            // --- TẠO DỮ LIỆU CARBON CREDIT ---
            var totalCO2 = journeyBatch.TotalCO2SavedKg;
            var carbonCredit = CarbonCredit.Issue(
                journeyBatch.Id,
                demoUserId,
                totalCO2,
                verificationRequest.Id,
                "0xabc123def4567890",
                null
            );
            var ccIdProperty = typeof(CarbonCredit).GetProperty("Id");
            ccIdProperty?.SetValue(carbonCredit, Guid.Parse("abcdef12-3456-4abc-9def-abcdef123456")); // ID cố định
            context.CarbonCredits.Add(carbonCredit);


            // --- TẠO DỮ LIỆU AUDIT REPORT ---
            var auditReport = new AuditReport
            {
                Id = Guid.Parse("fedcba98-7654-4fed-8cba-fedcba987654"), // ID cố định
                EntityId = journeyBatch.Id,
                EntityType = "JourneyBatch",
                Action = "Seed",
                ChangedBy = "system-seed",
                ChangeDate = seedTime,
                OriginalValues = "{}",
                NewValues = "{'Status':'Verified'}",
                CreatedAt = seedTime,
                LastModifiedAt = seedTime
            };
            context.AuditReports.Add(auditReport);


            // 3. Lưu tất cả thay đổi vào cơ sở dữ liệu
            await context.SaveChangesAsync();
        }
    }
}