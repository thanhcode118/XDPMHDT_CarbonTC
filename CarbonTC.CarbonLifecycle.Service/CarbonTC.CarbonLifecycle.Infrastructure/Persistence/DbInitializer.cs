using Microsoft.EntityFrameworkCore;
using CarbonTC.CarbonLifecycle.Domain.Entities;
using CarbonTC.CarbonLifecycle.Domain.Enums;
using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace CarbonTC.CarbonLifecycle.Infrastructure.Persistence
{
    public static class DbInitializer
    {
        public static async Task Initialize(AppDbContext context, ILogger? logger = null, bool forceSeed = false)
        {
            // 1. Áp dụng các Migration (nếu cần)
            await context.Database.MigrateAsync();
            logger?.LogInformation("Database migrations applied successfully");

            // 2. KIỂM TRA XEM DATABASE ĐÃ CÓ DỮ LIỆU CHƯA
            // Kiểm tra nhiều bảng để đảm bảo database đã được seed
            var hasCVAStandards = await context.CVAStandards.AnyAsync();
            var hasJourneyBatches = await context.JourneyBatches.AnyAsync();
            var hasEVJourneys = await context.EVJourneys.AnyAsync();
            var hasVerificationRequests = await context.VerificationRequests.AnyAsync();
            var hasCarbonCredits = await context.CarbonCredits.AnyAsync();
            
            // Nếu có ít nhất 2 trong số các bảng chính đã có dữ liệu, coi như database đã được seed
            var existingDataCount = new[] { hasCVAStandards, hasJourneyBatches, hasEVJourneys, hasVerificationRequests, hasCarbonCredits }
                .Count(x => x);
            
            // Nếu forceSeed = false và database đã có dữ liệu, không seed lại
            if (!forceSeed && existingDataCount >= 2)
            {
                // Database đã có dữ liệu, không seed lại
                logger?.LogInformation($"Database already contains data ({existingDataCount} tables have data). Skipping seed operation.");
                return;
            }
            
            if (forceSeed)
            {
                logger?.LogWarning("Force seed is enabled. Seeding database even if data exists.");
            }
            
            logger?.LogInformation("Database appears to be empty. Starting seed operation...");

            // 3. CHỈ SEED KHI DATABASE TRỐNG

            // ==========================================
            // ===== HẰNG SỐ VÀ KHỞI TẠO ID CỐ ĐỊNH =====
            // ==========================================
            // CHỈ 1 USER: auth0|demo-user-12345 (EVOwner)
            var demoUserId = "auth0|demo-user-12345";
            var seedTime = new DateTime(2025, 1, 15, 0, 0, 0, DateTimeKind.Utc);

            // CHÚ Ý: KHÔNG DÙNG Guid.NewGuid() NẾU BẠN MUỐN ID CỐ ĐỊNH GIỮA CÁC LẦN CHẠY!
            // Chúng ta sẽ dùng Factory Methods, nhưng vẫn cần ID cố định để tạo liên kết trong quá trình Seed.

            // --- TẠO DỮ LIỆU CVAStandards (10 standards) ---
            var cvaStandardType = typeof(CVAStandard);
            var idProperty = cvaStandardType.GetProperty("Id");

            var standardVFe34 = CVAStandard.Create("VERRA", "Vinfast-VFe34", 0.12m, 1.0m,
                new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                new DateTime(2025, 12, 31, 0, 0, 0, DateTimeKind.Utc), true);
            idProperty?.SetValue(standardVFe34, Guid.Parse("d2a0a0f0-a3b0-4b10-8b7a-0a0a0a0a0a01"));

            var standardTeslaY = CVAStandard.Create("GoldStandard", "Tesla-ModelY", 0.09m, 1.0m,
                new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                new DateTime(2025, 12, 31, 0, 0, 0, DateTimeKind.Utc), true);
            idProperty?.SetValue(standardTeslaY, Guid.Parse("e1b1b1f1-b4c1-4c21-9c8b-1b1b1b1b1b02"));

            var standardBYD = CVAStandard.Create("VCS", "BYD-Atto3", 0.11m, 1.5m,
                new DateTime(2024, 2, 1, 0, 0, 0, DateTimeKind.Utc),
                new DateTime(2026, 12, 31, 0, 0, 0, DateTimeKind.Utc), true);
            idProperty?.SetValue(standardBYD, Guid.Parse("f2c2c2f2-c5d2-4d32-ad9c-2c2c2c2c2c03"));

            var standardHyundai = CVAStandard.Create("CAR", "Hyundai-Kona", 0.10m, 1.2m,
                new DateTime(2024, 3, 1, 0, 0, 0, DateTimeKind.Utc),
                new DateTime(2026, 12, 31, 0, 0, 0, DateTimeKind.Utc), true);
            idProperty?.SetValue(standardHyundai, Guid.Parse("a3d3d3f3-d6e3-4e43-be0d-3d3d3d3d3d04"));

            var standardNissan = CVAStandard.Create("ACR", "Nissan-Leaf", 0.08m, 1.0m,
                new DateTime(2024, 1, 15, 0, 0, 0, DateTimeKind.Utc),
                new DateTime(2025, 12, 31, 0, 0, 0, DateTimeKind.Utc), true);
            idProperty?.SetValue(standardNissan, Guid.Parse("b4e4e4f4-e7f4-4f54-cf1e-4e4e4e4e4e05"));

            var standardBMW = CVAStandard.Create("VERRA", "BMW-iX3", 0.13m, 2.0m,
                new DateTime(2024, 4, 1, 0, 0, 0, DateTimeKind.Utc),
                new DateTime(2026, 12, 31, 0, 0, 0, DateTimeKind.Utc), true);
            idProperty?.SetValue(standardBMW, Guid.Parse("c5f5f5f5-f8a5-4a65-df2f-5f5f5f5f5f06"));

            var standardMercedes = CVAStandard.Create("GoldStandard", "Mercedes-EQC", 0.14m, 2.5m,
                new DateTime(2024, 5, 1, 0, 0, 0, DateTimeKind.Utc),
                new DateTime(2026, 12, 31, 0, 0, 0, DateTimeKind.Utc), true);
            idProperty?.SetValue(standardMercedes, Guid.Parse("d6a6a6f6-a9b6-4b76-ef3a-6a6a6a6a6a07"));

            var standardAudi = CVAStandard.Create("VCS", "Audi-e-tron", 0.15m, 2.0m,
                new DateTime(2024, 6, 1, 0, 0, 0, DateTimeKind.Utc),
                new DateTime(2026, 12, 31, 0, 0, 0, DateTimeKind.Utc), true);
            idProperty?.SetValue(standardAudi, Guid.Parse("e7b7b7f7-b0c7-4c87-ff4b-7b7b7b7b7b08"));

            var standardPorsche = CVAStandard.Create("CAR", "Porsche-Taycan", 0.16m, 3.0m,
                new DateTime(2024, 7, 1, 0, 0, 0, DateTimeKind.Utc),
                new DateTime(2026, 12, 31, 0, 0, 0, DateTimeKind.Utc), true);
            idProperty?.SetValue(standardPorsche, Guid.Parse("f8c8c8f8-c1d8-4d98-0f5c-8c8c8c8c8c09"));

            var standardKia = CVAStandard.Create("ACR", "Kia-EV6", 0.11m, 1.5m,
                new DateTime(2024, 8, 1, 0, 0, 0, DateTimeKind.Utc),
                new DateTime(2026, 12, 31, 0, 0, 0, DateTimeKind.Utc), true);
            idProperty?.SetValue(standardKia, Guid.Parse("a9d9d9f9-d2e9-4ea9-1f6d-9d9d9d9d9d10"));

            var cvaStandards = new CVAStandard[] { 
                standardVFe34, standardTeslaY, standardBYD, standardHyundai, standardNissan,
                standardBMW, standardMercedes, standardAudi, standardPorsche, standardKia 
            };
            context.CVAStandards.AddRange(cvaStandards);


            // --- TẠO DỮ LIỆU JOURNEY BATCHES (10 batches) ---
            var journeyBatchType = typeof(JourneyBatch);
            var journeyBatchIdProperty = journeyBatchType.GetProperty("Id");
            var statusProperty = journeyBatchType.GetProperty("Status");
            var verificationTimeProperty = journeyBatchType.GetProperty("VerificationTime");

            var batchGuids = new[]
            {
                Guid.Parse("b0b0b0b0-b0b0-4b0b-8b0b-0b0b0b0b0b0b"),
                Guid.Parse("b1b1b1b1-b1b1-4b1b-8b1b-1b1b1b1b1b1b"),
                Guid.Parse("b2b2b2b2-b2b2-4b2b-8b2b-2b2b2b2b2b2b"),
                Guid.Parse("b3b3b3b3-b3b3-4b3b-8b3b-3b3b3b3b3b3b"),
                Guid.Parse("b4b4b4b4-b4b4-4b4b-8b4b-4b4b4b4b4b4b"),
                Guid.Parse("b5b5b5b5-b5b5-4b5b-8b5b-5b5b5b5b5b5b"),
                Guid.Parse("b6b6b6b6-b6b6-4b6b-8b6b-6b6b6b6b6b6b"),
                Guid.Parse("b7b7b7b7-b7b7-4b7b-8b7b-7b7b7b7b7b7b"),
                Guid.Parse("b8b8b8b8-b8b8-4b8b-8b8b-8b8b8b8b8b8b"),
                Guid.Parse("b9b9b9b9-b9b9-4b9b-8b9b-9b9b9b9b9b9b")
            };

            var batchStatuses = new[]
            {
                JourneyBatchStatus.Verified,
                JourneyBatchStatus.CreditsIssued,
                JourneyBatchStatus.SubmittedForVerification,
                JourneyBatchStatus.Pending,
                JourneyBatchStatus.Verified,
                JourneyBatchStatus.CreditsIssued,
                JourneyBatchStatus.Rejected,
                JourneyBatchStatus.SubmittedForVerification,
                JourneyBatchStatus.Verified,
                JourneyBatchStatus.CreditsIssued
            };

            // Define data arrays - TẤT CẢ DỮ LIỆU CHO 1 USER: auth0|demo-user-12345
            var vehicleTypes = new[] { "Vinfast-VFe34", "Tesla-ModelY", "BYD-Atto3", "Hyundai-Kona", 
                "Nissan-Leaf", "BMW-iX3", "Mercedes-EQC", "Audi-e-tron", "Porsche-Taycan", "Kia-EV6" };
            var distances = new[] { 85.5m, 42.0m, 120.3m, 65.7m, 95.2m, 150.8m, 78.4m, 110.6m, 200.5m, 88.9m };
            var conversionRates = new[] { 0.12m, 0.09m, 0.11m, 0.10m, 0.08m, 0.13m, 0.14m, 0.15m, 0.16m, 0.11m };

            // Địa điểm Việt Nam - Origin và Destination
            var vietnamOrigins = new[] 
            { 
                "Hà Nội, Việt Nam", 
                "TP. Hồ Chí Minh, Việt Nam", 
                "Đà Nẵng, Việt Nam", 
                "Hải Phòng, Việt Nam", 
                "Cần Thơ, Việt Nam", 
                "Nha Trang, Việt Nam", 
                "Huế, Việt Nam", 
                "Vũng Tàu, Việt Nam", 
                "Quy Nhon, Việt Nam", 
                "Đà Lạt, Việt Nam" 
            };
            var vietnamDestinations = new[] 
            { 
                "TP. Hồ Chí Minh, Việt Nam", 
                "Đà Nẵng, Việt Nam", 
                "Hà Nội, Việt Nam", 
                "Cần Thơ, Việt Nam", 
                "Nha Trang, Việt Nam", 
                "Huế, Việt Nam", 
                "Vũng Tàu, Việt Nam", 
                "Hải Phòng, Việt Nam", 
                "Đà Lạt, Việt Nam", 
                "Quy Nhon, Việt Nam" 
            };

            // --- TẠO DỮ LIỆU JOURNEY BATCHES (10 batches) - TẤT CẢ CHO 1 USER ---
            var journeyBatches = new List<JourneyBatch>();
            for (int i = 0; i < 10; i++)
            {
                var batch = JourneyBatch.Create(demoUserId); // CHỈ 1 USER
                journeyBatchIdProperty?.SetValue(batch, batchGuids[i]);
                
                // Add journey summary to batch
                var co2Saved = distances[i] * conversionRates[i];
                batch.AddJourneySummary(distances[i], co2Saved);
                
                statusProperty?.SetValue(batch, batchStatuses[i]);
                if (batchStatuses[i] == JourneyBatchStatus.Verified || 
                    batchStatuses[i] == JourneyBatchStatus.CreditsIssued ||
                    batchStatuses[i] == JourneyBatchStatus.Rejected)
                {
                    verificationTimeProperty?.SetValue(batch, seedTime.AddDays(-i));
                }
                journeyBatches.Add(batch);
            }
            context.JourneyBatches.AddRange(journeyBatches);


            // --- TẠO DỮ LIỆU EV JOURNEYS (10 journeys) - TẤT CẢ CHO 1 USER, ĐỊA ĐIỂM VIỆT NAM ---
            var journeyType = typeof(EVJourney);
            var journeyIdProperty = journeyType.GetProperty("Id");

            var journeyGuids = new[]
            {
                Guid.Parse("a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d"),
                Guid.Parse("a2b3c4d5-f6a7-4b8c-9d0e-1f2a3b4c5d6e"),
                Guid.Parse("a3b4c5d6-a7b8-4c9d-0e1f-2a3b4c5d6e7f"),
                Guid.Parse("a4b5c6d7-b8c9-4d0e-1f2a-3b4c5d6e7f8a"),
                Guid.Parse("a5b6c7d8-c9d0-4e1f-2a3b-4c5d6e7f8a9b"),
                Guid.Parse("a6b7c8d9-d0e1-4f2a-3b4c-5d6e7f8a9b0c"),
                Guid.Parse("a7b8c9d0-e1f2-4a3b-4c5d-6e7f8a9b0c1d"),
                Guid.Parse("a8b9c0d1-f2a3-4b4c-5d6e-7f8a9b0c1d2e"),
                Guid.Parse("a9b0c1d2-a3b4-4c5d-6e7f-8a9b0c1d2e3f"),
                Guid.Parse("a0b1c2d3-b4c5-4d6e-7f8a-9b0c1d2e3f4a")
            };

            var evJourneys = new List<EVJourney>();
            for (int i = 0; i < 10; i++)
            {
                var startTime = seedTime.AddDays(-i).AddHours(-2);
                var endTime = startTime.AddHours(1.5);
                var journey = EVJourney.Create(
                    batchGuids[i],
                    demoUserId, // CHỈ 1 USER
                    distances[i],
                    startTime,
                    endTime,
                    vehicleTypes[i],
                    vietnamOrigins[i], // ĐỊA ĐIỂM VIỆT NAM
                    vietnamDestinations[i], // ĐỊA ĐIỂM VIỆT NAM
                    distances[i] * conversionRates[i]
                );
                journeyIdProperty?.SetValue(journey, journeyGuids[i]);
                evJourneys.Add(journey);
            }
            context.EVJourneys.AddRange(evJourneys);

            // LƯU Ý: Các journeys trên được tạo với status = Pending (mặc định từ EVJourney.Create())
            // và được gán vào các batches. Tuy nhiên, vì không gọi AssignToBatch(), 
            // status vẫn là Pending, nên chúng có thể được chọn để tạo batch mới.
            // Frontend sẽ lọc và hiển thị các journeys có status = Pending.

            // --- TẠO DỮ LIỆU VERIFICATION REQUESTS (10 requests) ---
            var verificationRequestType = typeof(VerificationRequest);
            var vIdProperty = verificationRequestType.GetProperty("Id");

            var verificationRequestGuids = new[]
            {
                Guid.Parse("12345678-90ab-4cde-8fab-1234567890ab"),
                Guid.Parse("23456789-01bc-4def-9abc-2345678901bc"),
                Guid.Parse("34567890-12cd-4ef0-abcd-3456789012cd"),
                Guid.Parse("45678901-23de-4f01-bcde-4567890123de"),
                Guid.Parse("56789012-34ef-4012-cdef-5678901234ef"),
                Guid.Parse("67890123-45f0-4123-def0-6789012345f0"),
                Guid.Parse("78901234-5601-4234-ef01-789012345601"),
                Guid.Parse("89012345-6712-4345-f012-890123456712"),
                Guid.Parse("90123456-7823-4456-0123-901234567823"),
                Guid.Parse("01234567-8934-4567-1234-012345678934")
            };

            var verificationRequests = new List<VerificationRequest>();
            var standardIds = new[] { standardVFe34.Id, standardTeslaY.Id, standardBYD.Id, standardHyundai.Id,
                standardNissan.Id, standardBMW.Id, standardMercedes.Id, standardAudi.Id, standardPorsche.Id, standardKia.Id };

            for (int i = 0; i < 10; i++)
            {
                var request = VerificationRequest.Create(
                    batchGuids[i],
                    demoUserId, // CHỈ 1 USER
                    $"Verification request for batch {i + 1}"
                );
                vIdProperty?.SetValue(request, verificationRequestGuids[i]);

                // Set different statuses
                if (i < 3) // First 3 approved
                {
                    request.MarkAsApproved("verifier-001", standardIds[i], $"Approved batch {i + 1}");
                }
                else if (i < 5) // Next 2 rejected
                {
                    request.MarkAsRejected("verifier-002", $"Rejected batch {i + 1} - insufficient data");
                }
                // Rest remain pending

                verificationRequests.Add(request);
            }
            context.VerificationRequests.AddRange(verificationRequests);


            // --- TẠO DỮ LIỆU CARBON CREDITS (10 credits) ---
            var carbonCreditType = typeof(CarbonCredit);
            var ccIdProperty = carbonCreditType.GetProperty("Id");

            var carbonCreditGuids = new[]
            {
                Guid.Parse("abcdef12-3456-4abc-9def-abcdef123456"),
                Guid.Parse("bcdef123-4567-4bcd-0ef1-bcdef1234567"),
                Guid.Parse("cdef1234-5678-4cde-1f12-cdef12345678"),
                Guid.Parse("def12345-6789-4def-2123-def123456789"),
                Guid.Parse("ef123456-7890-4ef0-3234-ef1234567890"),
                Guid.Parse("f1234567-8901-4f01-4345-f12345678901"),
                Guid.Parse("12345678-9012-4012-5456-123456789012"),
                Guid.Parse("23456789-0123-4123-6567-234567890123"),
                Guid.Parse("34567890-1234-4234-7678-345678901234"),
                Guid.Parse("45678901-2345-4345-8789-456789012345")
            };

            var carbonCredits = new List<CarbonCredit>();
            for (int i = 0; i < 10; i++)
            {
                var totalCO2 = distances[i] * conversionRates[i];
                // Generate transaction hash from GUID
                var txHash = $"0x{carbonCreditGuids[i].ToString().Replace("-", "").Substring(0, 16)}";
                var credit = CarbonCredit.Issue(
                    batchGuids[i],
                    demoUserId, // CHỈ 1 USER
                    totalCO2,
                    i < 3 ? verificationRequestGuids[i] : null, // Link first 3 to verification requests
                    txHash,
                    DateTime.UtcNow.AddYears(2)
                );
                ccIdProperty?.SetValue(credit, carbonCreditGuids[i]);
                carbonCredits.Add(credit);
            }
            context.CarbonCredits.AddRange(carbonCredits);


            // --- TẠO DỮ LIỆU AUDIT REPORTS (10 reports) ---
            var auditReportGuids = new[]
            {
                Guid.Parse("fedcba98-7654-4fed-8cba-fedcba987654"),
                Guid.Parse("edcba987-6543-4edc-7ba9-edcba9876543"),
                Guid.Parse("dcba9876-5432-4dcb-6a98-dcba98765432"),
                Guid.Parse("cba98765-4321-4cba-5987-cba987654321"),
                Guid.Parse("ba987654-3210-4ba9-4876-ba9876543210"),
                Guid.Parse("a9876543-2109-4a98-3765-a98765432109"),
                Guid.Parse("98765432-1098-4987-2654-987654321098"),
                Guid.Parse("87654321-0987-4876-1543-876543210987"),
                Guid.Parse("76543210-9876-4765-0432-765432109876"),
                Guid.Parse("65432109-8765-4654-9321-654321098765")
            };

            var entityTypes = new[] { "JourneyBatch", "CarbonCredit", "VerificationRequest", "EVJourney",
                "JourneyBatch", "CarbonCredit", "VerificationRequest", "EVJourney", "JourneyBatch", "CarbonCredit" };
            var actions = new[] { "Created", "Updated", "Verified", "Issued", "Rejected", "Approved", 
                "Created", "Updated", "Verified", "Issued" };

            var auditReports = new List<AuditReport>();
            for (int i = 0; i < 10; i++)
            {
                var report = new AuditReport
                {
                    Id = auditReportGuids[i],
                    EntityId = i < 3 ? batchGuids[i] : (i < 6 ? carbonCreditGuids[i - 3] : journeyGuids[i - 6]),
                    EntityType = entityTypes[i],
                    Action = actions[i],
                    ChangedBy = i % 2 == 0 ? "system-seed" : demoUserId, // CHỈ 1 USER
                    ChangeDate = seedTime.AddDays(-i),
                    OriginalValues = "{}",
                    NewValues = $"{{\"Status\":\"{actions[i]}\"}}",
                    CreatedAt = seedTime.AddDays(-i),
                    LastModifiedAt = seedTime.AddDays(-i)
                };
                auditReports.Add(report);
            }
            context.AuditReports.AddRange(auditReports);


            // 3. Lưu tất cả thay đổi vào cơ sở dữ liệu
            await context.SaveChangesAsync();
            logger?.LogInformation("Database seed operation completed successfully.");
        }

        /// <summary>
        /// Thêm dữ liệu seed vào database đã có sẵn dữ liệu (không kiểm tra điều kiện)
        /// </summary>
        public static async Task AddMoreSeedData(AppDbContext context)
        {
            // 1. Áp dụng các Migration (nếu cần)
            await context.Database.MigrateAsync();

            // CHỈ 1 USER: auth0|demo-user-12345 (EVOwner)
            var demoUserId = "auth0|demo-user-12345";
            var seedTime = DateTime.UtcNow;

            // --- TẠO THÊM DỮ LIỆU CVAStandards (10 standards) ---
            var cvaStandardType = typeof(CVAStandard);
            var idProperty = cvaStandardType.GetProperty("Id");

            var standardVFe34 = CVAStandard.Create("VERRA", "Vinfast-VFe34", 0.12m, 1.0m,
                new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                new DateTime(2025, 12, 31, 0, 0, 0, DateTimeKind.Utc), true);
            idProperty?.SetValue(standardVFe34, Guid.NewGuid());

            var standardTeslaY = CVAStandard.Create("GoldStandard", "Tesla-ModelY", 0.09m, 1.0m,
                new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                new DateTime(2025, 12, 31, 0, 0, 0, DateTimeKind.Utc), true);
            idProperty?.SetValue(standardTeslaY, Guid.NewGuid());

            var standardBYD = CVAStandard.Create("VCS", "BYD-Atto3", 0.11m, 1.5m,
                new DateTime(2024, 2, 1, 0, 0, 0, DateTimeKind.Utc),
                new DateTime(2026, 12, 31, 0, 0, 0, DateTimeKind.Utc), true);
            idProperty?.SetValue(standardBYD, Guid.NewGuid());

            var standardHyundai = CVAStandard.Create("CAR", "Hyundai-Kona", 0.10m, 1.2m,
                new DateTime(2024, 3, 1, 0, 0, 0, DateTimeKind.Utc),
                new DateTime(2026, 12, 31, 0, 0, 0, DateTimeKind.Utc), true);
            idProperty?.SetValue(standardHyundai, Guid.NewGuid());

            var standardNissan = CVAStandard.Create("ACR", "Nissan-Leaf", 0.08m, 1.0m,
                new DateTime(2024, 1, 15, 0, 0, 0, DateTimeKind.Utc),
                new DateTime(2025, 12, 31, 0, 0, 0, DateTimeKind.Utc), true);
            idProperty?.SetValue(standardNissan, Guid.NewGuid());

            var standardBMW = CVAStandard.Create("VERRA", "BMW-iX3", 0.13m, 2.0m,
                new DateTime(2024, 4, 1, 0, 0, 0, DateTimeKind.Utc),
                new DateTime(2026, 12, 31, 0, 0, 0, DateTimeKind.Utc), true);
            idProperty?.SetValue(standardBMW, Guid.NewGuid());

            var standardMercedes = CVAStandard.Create("GoldStandard", "Mercedes-EQC", 0.14m, 2.5m,
                new DateTime(2024, 5, 1, 0, 0, 0, DateTimeKind.Utc),
                new DateTime(2026, 12, 31, 0, 0, 0, DateTimeKind.Utc), true);
            idProperty?.SetValue(standardMercedes, Guid.NewGuid());

            var standardAudi = CVAStandard.Create("VCS", "Audi-e-tron", 0.15m, 2.0m,
                new DateTime(2024, 6, 1, 0, 0, 0, DateTimeKind.Utc),
                new DateTime(2026, 12, 31, 0, 0, 0, DateTimeKind.Utc), true);
            idProperty?.SetValue(standardAudi, Guid.NewGuid());

            var standardPorsche = CVAStandard.Create("CAR", "Porsche-Taycan", 0.16m, 3.0m,
                new DateTime(2024, 7, 1, 0, 0, 0, DateTimeKind.Utc),
                new DateTime(2026, 12, 31, 0, 0, 0, DateTimeKind.Utc), true);
            idProperty?.SetValue(standardPorsche, Guid.NewGuid());

            var standardKia = CVAStandard.Create("ACR", "Kia-EV6", 0.11m, 1.5m,
                new DateTime(2024, 8, 1, 0, 0, 0, DateTimeKind.Utc),
                new DateTime(2026, 12, 31, 0, 0, 0, DateTimeKind.Utc), true);
            idProperty?.SetValue(standardKia, Guid.NewGuid());

            var cvaStandards = new CVAStandard[] { 
                standardVFe34, standardTeslaY, standardBYD, standardHyundai, standardNissan,
                standardBMW, standardMercedes, standardAudi, standardPorsche, standardKia 
            };
            context.CVAStandards.AddRange(cvaStandards);

            // Define data arrays - TẤT CẢ DỮ LIỆU CHO 1 USER: auth0|demo-user-12345
            var vehicleTypes = new[] { "Vinfast-VFe34", "Tesla-ModelY", "BYD-Atto3", "Hyundai-Kona", 
                "Nissan-Leaf", "BMW-iX3", "Mercedes-EQC", "Audi-e-tron", "Porsche-Taycan", "Kia-EV6" };
            var distances = new[] { 85.5m, 42.0m, 120.3m, 65.7m, 95.2m, 150.8m, 78.4m, 110.6m, 200.5m, 88.9m };
            var conversionRates = new[] { 0.12m, 0.09m, 0.11m, 0.10m, 0.08m, 0.13m, 0.14m, 0.15m, 0.16m, 0.11m };

            // Địa điểm Việt Nam - Origin và Destination
            var vietnamOrigins = new[] 
            { 
                "Hà Nội, Việt Nam", 
                "TP. Hồ Chí Minh, Việt Nam", 
                "Đà Nẵng, Việt Nam", 
                "Hải Phòng, Việt Nam", 
                "Cần Thơ, Việt Nam", 
                "Nha Trang, Việt Nam", 
                "Huế, Việt Nam", 
                "Vũng Tàu, Việt Nam", 
                "Quy Nhon, Việt Nam", 
                "Đà Lạt, Việt Nam" 
            };
            var vietnamDestinations = new[] 
            { 
                "TP. Hồ Chí Minh, Việt Nam", 
                "Đà Nẵng, Việt Nam", 
                "Hà Nội, Việt Nam", 
                "Cần Thơ, Việt Nam", 
                "Nha Trang, Việt Nam", 
                "Huế, Việt Nam", 
                "Vũng Tàu, Việt Nam", 
                "Hải Phòng, Việt Nam", 
                "Đà Lạt, Việt Nam", 
                "Quy Nhon, Việt Nam" 
            };

            // --- TẠO THÊM DỮ LIỆU JOURNEY BATCHES (10 batches) ---
            var journeyBatchType = typeof(JourneyBatch);
            var journeyBatchIdProperty = journeyBatchType.GetProperty("Id");
            var statusProperty = journeyBatchType.GetProperty("Status");
            var verificationTimeProperty = journeyBatchType.GetProperty("VerificationTime");

            var batchStatuses = new[]
            {
                JourneyBatchStatus.Verified,
                JourneyBatchStatus.CreditsIssued,
                JourneyBatchStatus.SubmittedForVerification,
                JourneyBatchStatus.Pending,
                JourneyBatchStatus.Verified,
                JourneyBatchStatus.CreditsIssued,
                JourneyBatchStatus.Rejected,
                JourneyBatchStatus.SubmittedForVerification,
                JourneyBatchStatus.Verified,
                JourneyBatchStatus.CreditsIssued
            };

            // --- TẠO THÊM DỮ LIỆU JOURNEY BATCHES (10 batches) - TẤT CẢ CHO 1 USER ---
            var journeyBatches = new List<JourneyBatch>();
            var batchGuids = new List<Guid>();
            for (int i = 0; i < 10; i++)
            {
                var batchGuid = Guid.NewGuid();
                batchGuids.Add(batchGuid);
                var batch = JourneyBatch.Create(demoUserId); // CHỈ 1 USER
                journeyBatchIdProperty?.SetValue(batch, batchGuid);
                
                var co2Saved = distances[i] * conversionRates[i];
                batch.AddJourneySummary(distances[i], co2Saved);
                
                statusProperty?.SetValue(batch, batchStatuses[i]);
                if (batchStatuses[i] == JourneyBatchStatus.Verified || 
                    batchStatuses[i] == JourneyBatchStatus.CreditsIssued ||
                    batchStatuses[i] == JourneyBatchStatus.Rejected)
                {
                    verificationTimeProperty?.SetValue(batch, seedTime.AddDays(-i));
                }
                journeyBatches.Add(batch);
            }
            context.JourneyBatches.AddRange(journeyBatches);

            // --- TẠO THÊM DỮ LIỆU EV JOURNEYS (10 journeys) - TẤT CẢ CHO 1 USER, ĐỊA ĐIỂM VIỆT NAM ---
            var journeyType = typeof(EVJourney);
            var journeyIdProperty = journeyType.GetProperty("Id");

            var evJourneys = new List<EVJourney>();
            for (int i = 0; i < 10; i++)
            {
                var startTime = seedTime.AddDays(-i).AddHours(-2);
                var endTime = startTime.AddHours(1.5);
                var journey = EVJourney.Create(
                    batchGuids[i],
                    demoUserId, // CHỈ 1 USER
                    distances[i],
                    startTime,
                    endTime,
                    vehicleTypes[i],
                    vietnamOrigins[i], // ĐỊA ĐIỂM VIỆT NAM
                    vietnamDestinations[i], // ĐỊA ĐIỂM VIỆT NAM
                    distances[i] * conversionRates[i]
                );
                journeyIdProperty?.SetValue(journey, Guid.NewGuid());
                evJourneys.Add(journey);
            }
            context.EVJourneys.AddRange(evJourneys);

            // --- TẠO THÊM DỮ LIỆU VERIFICATION REQUESTS (10 requests) ---
            var verificationRequestType = typeof(VerificationRequest);
            var vIdProperty = verificationRequestType.GetProperty("Id");

            var verificationRequests = new List<VerificationRequest>();
            var verificationRequestGuids = new List<Guid>();
            var standardIds = new[] { standardVFe34.Id, standardTeslaY.Id, standardBYD.Id, standardHyundai.Id,
                standardNissan.Id, standardBMW.Id, standardMercedes.Id, standardAudi.Id, standardPorsche.Id, standardKia.Id };

            for (int i = 0; i < 10; i++)
            {
                var requestGuid = Guid.NewGuid();
                verificationRequestGuids.Add(requestGuid);
                var request = VerificationRequest.Create(
                    batchGuids[i],
                    demoUserId, // CHỈ 1 USER
                    $"Verification request for batch {i + 1}"
                );
                vIdProperty?.SetValue(request, requestGuid);

                if (i < 3)
                {
                    request.MarkAsApproved("verifier-001", standardIds[i], $"Approved batch {i + 1}");
                }
                else if (i < 5)
                {
                    request.MarkAsRejected("verifier-002", $"Rejected batch {i + 1} - insufficient data");
                }

                verificationRequests.Add(request);
            }
            context.VerificationRequests.AddRange(verificationRequests);

            // --- TẠO THÊM DỮ LIỆU CARBON CREDITS (10 credits) ---
            var carbonCreditType = typeof(CarbonCredit);
            var ccIdProperty = carbonCreditType.GetProperty("Id");

            var carbonCredits = new List<CarbonCredit>();
            for (int i = 0; i < 10; i++)
            {
                var totalCO2 = distances[i] * conversionRates[i];
                var creditGuid = Guid.NewGuid();
                var txHash = $"0x{creditGuid.ToString().Replace("-", "").Substring(0, 16)}";
                var credit = CarbonCredit.Issue(
                    batchGuids[i],
                    demoUserId, // CHỈ 1 USER
                    totalCO2,
                    i < 3 ? verificationRequestGuids[i] : null,
                    txHash,
                    DateTime.UtcNow.AddYears(2)
                );
                ccIdProperty?.SetValue(credit, creditGuid);
                carbonCredits.Add(credit);
            }
            context.CarbonCredits.AddRange(carbonCredits);

            // --- TẠO THÊM DỮ LIỆU AUDIT REPORTS (10 reports) ---
            var entityTypes = new[] { "JourneyBatch", "CarbonCredit", "VerificationRequest", "EVJourney",
                "JourneyBatch", "CarbonCredit", "VerificationRequest", "EVJourney", "JourneyBatch", "CarbonCredit" };
            var actions = new[] { "Created", "Updated", "Verified", "Issued", "Rejected", "Approved", 
                "Created", "Updated", "Verified", "Issued" };

            var auditReports = new List<AuditReport>();
            var carbonCreditGuids = carbonCredits.Select(c => 
            {
                var idProp = typeof(CarbonCredit).GetProperty("Id");
                return (Guid)(idProp?.GetValue(c) ?? Guid.Empty);
            }).ToList();
            var evJourneyGuids = evJourneys.Select(j => j.Id).ToList();

            for (int i = 0; i < 10; i++)
            {
                var entityId = i < 3 ? batchGuids[i] : (i < 6 ? carbonCreditGuids[i - 3] : evJourneyGuids[i - 6]);
                var report = new AuditReport
                {
                    Id = Guid.NewGuid(),
                    EntityId = entityId,
                    EntityType = entityTypes[i],
                    Action = actions[i],
                    ChangedBy = i % 2 == 0 ? "system-seed" : demoUserId, // CHỈ 1 USER
                    ChangeDate = seedTime.AddDays(-i),
                    OriginalValues = "{}",
                    NewValues = $"{{\"Status\":\"{actions[i]}\"}}",
                    CreatedAt = seedTime.AddDays(-i),
                    LastModifiedAt = seedTime.AddDays(-i)
                };
                auditReports.Add(report);
            }
            context.AuditReports.AddRange(auditReports);

            // Lưu tất cả thay đổi vào cơ sở dữ liệu
            await context.SaveChangesAsync();
        }
    }
}