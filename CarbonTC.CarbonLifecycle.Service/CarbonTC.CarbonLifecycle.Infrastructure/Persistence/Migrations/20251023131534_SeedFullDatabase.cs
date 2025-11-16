using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace CarbonTC.CarbonLifecycle.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class SeedFullDatabase : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "AuditReports",
                columns: new[] { "Id", "Action", "ChangeDate", "ChangedBy", "CreatedAt", "EntityId", "EntityType", "LastModifiedAt", "NewValues", "OriginalValues" },
                values: new object[] { new Guid("fedcba98-7654-4fed-8cba-fedcba987654"), "Seed", new DateTime(2025, 10, 23, 0, 0, 0, 0, DateTimeKind.Utc), "system-seed", new DateTime(2025, 10, 23, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("b0b0b0b0-b0b0-4b0b-8b0b-0b0b0b0b0b0b"), "JourneyBatch", new DateTime(2025, 10, 23, 0, 0, 0, 0, DateTimeKind.Utc), "{'Status':'Verified'}", "{}" });

            migrationBuilder.InsertData(
                table: "CVAStandards",
                columns: new[] { "Id", "ConversionRate", "CreatedAt", "EffectiveDate", "EndDate", "IsActive", "LastModifiedAt", "MinDistanceRequirement", "StandardName", "VehicleType" },
                values: new object[,]
                {
                    { new Guid("d2a0a0f0-a3b0-4b10-8b7a-0a0a0a0a0a01"), 0.12m, new DateTime(2025, 10, 23, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 12, 31, 0, 0, 0, 0, DateTimeKind.Utc), true, new DateTime(2025, 10, 23, 0, 0, 0, 0, DateTimeKind.Utc), 1.0m, "TC-Std-VFe34-2024", "Vinfast-VFe34" },
                    { new Guid("e1b1b1f1-b4c1-4c21-9c8b-1b1b1b1b1b02"), 0.09m, new DateTime(2025, 10, 23, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 12, 31, 0, 0, 0, 0, DateTimeKind.Utc), true, new DateTime(2025, 10, 23, 0, 0, 0, 0, DateTimeKind.Utc), 1.0m, "TC-Std-TeslaY-2024", "Tesla-ModelY" }
                });

            migrationBuilder.InsertData(
                table: "JourneyBatches",
                columns: new[] { "Id", "CreatedAt", "CreationTime", "LastModifiedAt", "NumberOfJourneys", "Status", "TotalCO2SavedKg", "TotalDistanceKm", "UserId", "VerificationTime" },
                values: new object[] { new Guid("b0b0b0b0-b0b0-4b0b-8b0b-0b0b0b0b0b0b"), new DateTime(2025, 10, 23, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 10, 23, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 10, 23, 0, 0, 0, 0, DateTimeKind.Utc), 2, 2, 14.040m, 127.5m, "auth0|demo-user-12345", new DateTime(2025, 10, 23, 0, 0, 0, 0, DateTimeKind.Utc) });

            migrationBuilder.InsertData(
                table: "CarbonCredits",
                columns: new[] { "Id", "AmountKgCO2e", "CreatedAt", "ExpiryDate", "IssueDate", "JourneyBatchId", "LastModifiedAt", "Status", "TransactionHash", "UserId" },
                values: new object[] { new Guid("abcdef12-3456-4abc-9def-abcdef123456"), 14.040m, new DateTime(2025, 10, 23, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2025, 10, 23, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("b0b0b0b0-b0b0-4b0b-8b0b-0b0b0b0b0b0b"), new DateTime(2025, 10, 23, 0, 0, 0, 0, DateTimeKind.Utc), 1, "0xabc123def4567890", "auth0|demo-user-12345" });

            migrationBuilder.InsertData(
                table: "EVJourneys",
                columns: new[] { "Id", "CO2EstimateKg", "CreatedAt", "Destination", "DistanceKm", "EndTime", "JourneyBatchId", "LastModifiedAt", "Origin", "StartTime", "Status", "UserId", "VehicleType" },
                values: new object[,]
                {
                    { new Guid("a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d"), 10.260m, new DateTime(2025, 10, 23, 0, 0, 0, 0, DateTimeKind.Utc), "N/A", 85.5m, new DateTime(2025, 10, 20, 9, 15, 0, 0, DateTimeKind.Utc), new Guid("b0b0b0b0-b0b0-4b0b-8b0b-0b0b0b0b0b0b"), new DateTime(2025, 10, 23, 0, 0, 0, 0, DateTimeKind.Utc), "N/A", new DateTime(2025, 10, 20, 8, 0, 0, 0, DateTimeKind.Utc), 3, "auth0|demo-user-12345", "Vinfast-VFe34" },
                    { new Guid("f6e5d4c3-b2a1-4c5d-9e8f-1a2b3c4d5e6f"), 3.780m, new DateTime(2025, 10, 23, 0, 0, 0, 0, DateTimeKind.Utc), "N/A", 42.0m, new DateTime(2025, 10, 21, 15, 0, 0, 0, DateTimeKind.Utc), new Guid("b0b0b0b0-b0b0-4b0b-8b0b-0b0b0b0b0b0b"), new DateTime(2025, 10, 23, 0, 0, 0, 0, DateTimeKind.Utc), "N/A", new DateTime(2025, 10, 21, 14, 0, 0, 0, DateTimeKind.Utc), 3, "auth0|demo-user-12345", "Tesla-ModelY" }
                });

            migrationBuilder.InsertData(
                table: "VerificationRequests",
                columns: new[] { "Id", "CreatedAt", "JourneyBatchId", "LastModifiedAt", "Notes", "RequestDate", "RequestorId", "Status", "VerificationDate", "VerifierId" },
                values: new object[] { new Guid("12345678-90ab-4cde-8fab-1234567890ab"), new DateTime(2025, 10, 23, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("b0b0b0b0-b0b0-4b0b-8b0b-0b0b0b0b0b0b"), new DateTime(2025, 10, 23, 0, 0, 0, 0, DateTimeKind.Utc), "Seed data - automatically approved.", new DateTime(2025, 10, 23, 0, 0, 0, 0, DateTimeKind.Utc), "auth0|demo-user-12345", 1, new DateTime(2025, 10, 23, 0, 0, 0, 0, DateTimeKind.Utc), "system-seed" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AuditReports",
                keyColumn: "Id",
                keyValue: new Guid("fedcba98-7654-4fed-8cba-fedcba987654"));

            migrationBuilder.DeleteData(
                table: "CVAStandards",
                keyColumn: "Id",
                keyValue: new Guid("d2a0a0f0-a3b0-4b10-8b7a-0a0a0a0a0a01"));

            migrationBuilder.DeleteData(
                table: "CVAStandards",
                keyColumn: "Id",
                keyValue: new Guid("e1b1b1f1-b4c1-4c21-9c8b-1b1b1b1b1b02"));

            migrationBuilder.DeleteData(
                table: "CarbonCredits",
                keyColumn: "Id",
                keyValue: new Guid("abcdef12-3456-4abc-9def-abcdef123456"));

            migrationBuilder.DeleteData(
                table: "EVJourneys",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d"));

            migrationBuilder.DeleteData(
                table: "EVJourneys",
                keyColumn: "Id",
                keyValue: new Guid("f6e5d4c3-b2a1-4c5d-9e8f-1a2b3c4d5e6f"));

            migrationBuilder.DeleteData(
                table: "VerificationRequests",
                keyColumn: "Id",
                keyValue: new Guid("12345678-90ab-4cde-8fab-1234567890ab"));

            migrationBuilder.DeleteData(
                table: "JourneyBatches",
                keyColumn: "Id",
                keyValue: new Guid("b0b0b0b0-b0b0-4b0b-8b0b-0b0b0b0b0b0b"));
        }
    }
}
