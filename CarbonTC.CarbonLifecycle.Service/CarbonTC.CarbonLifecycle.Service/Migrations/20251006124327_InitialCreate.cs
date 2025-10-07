using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CarbonTC.CarbonLifecycle.Service.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "CVAStandards",
                columns: table => new
                {
                    StandardId = table.Column<Guid>(type: "char(36)", nullable: false),
                    StandardName = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "longtext", nullable: true),
                    ConversionRate = table.Column<double>(type: "double", nullable: false),
                    MinDistanceRequirement = table.Column<double>(type: "double", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CVAStandards", x => x.StandardId);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "JourneyBatches",
                columns: table => new
                {
                    BatchId = table.Column<Guid>(type: "char(36)", nullable: false),
                    OwnerId = table.Column<Guid>(type: "char(36)", nullable: false),
                    TotalDistanceKm = table.Column<double>(type: "double", nullable: false),
                    TotalCO2SavedKg = table.Column<double>(type: "double", nullable: false),
                    CalculatedCredits = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "longtext", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JourneyBatches", x => x.BatchId);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "EVJourneys",
                columns: table => new
                {
                    JourneyId = table.Column<Guid>(type: "char(36)", nullable: false),
                    OwnerId = table.Column<Guid>(type: "char(36)", nullable: false),
                    StartTime = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    EndTime = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    BatchId = table.Column<Guid>(type: "char(36)", nullable: true),
                    UploadedFilePath = table.Column<string>(type: "longtext", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EVJourneys", x => x.JourneyId);
                    table.ForeignKey(
                        name: "FK_EVJourneys_JourneyBatches_BatchId",
                        column: x => x.BatchId,
                        principalTable: "JourneyBatches",
                        principalColumn: "BatchId");
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "VerificationRequests",
                columns: table => new
                {
                    RequestId = table.Column<Guid>(type: "char(36)", nullable: false),
                    OwnerId = table.Column<Guid>(type: "char(36)", nullable: false),
                    BatchId = table.Column<Guid>(type: "char(36)", nullable: false),
                    StandardId = table.Column<Guid>(type: "char(36)", nullable: false),
                    Status = table.Column<string>(type: "longtext", nullable: false),
                    ReviewedBy = table.Column<Guid>(type: "char(36)", nullable: true),
                    SubmittedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    ReviewedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    Remarks = table.Column<string>(type: "longtext", nullable: true),
                    VerificationStandard = table.Column<string>(type: "longtext", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VerificationRequests", x => x.RequestId);
                    table.ForeignKey(
                        name: "FK_VerificationRequests_CVAStandards_StandardId",
                        column: x => x.StandardId,
                        principalTable: "CVAStandards",
                        principalColumn: "StandardId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_VerificationRequests_JourneyBatches_BatchId",
                        column: x => x.BatchId,
                        principalTable: "JourneyBatches",
                        principalColumn: "BatchId",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "AuditReports",
                columns: table => new
                {
                    ReportId = table.Column<Guid>(type: "char(36)", nullable: false),
                    RequestId = table.Column<Guid>(type: "char(36)", nullable: false),
                    GeneratedBy = table.Column<Guid>(type: "char(36)", nullable: false),
                    ReportType = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false),
                    FilePath = table.Column<string>(type: "longtext", nullable: true),
                    Findings = table.Column<string>(type: "longtext", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    AuditDate = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditReports", x => x.ReportId);
                    table.ForeignKey(
                        name: "FK_AuditReports_VerificationRequests_RequestId",
                        column: x => x.RequestId,
                        principalTable: "VerificationRequests",
                        principalColumn: "RequestId",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "CarbonCredits",
                columns: table => new
                {
                    CreditId = table.Column<Guid>(type: "char(36)", nullable: false),
                    OwnerId = table.Column<Guid>(type: "char(36)", nullable: false),
                    RequestId = table.Column<Guid>(type: "char(36)", nullable: false),
                    IssuedByCVA = table.Column<Guid>(type: "char(36)", nullable: true),
                    Amount = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "longtext", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CreditType = table.Column<string>(type: "longtext", nullable: false),
                    Vintage = table.Column<int>(type: "int", nullable: false),
                    CreditSerialNumber = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false),
                    ExpiryDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    IssuedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CarbonCredits", x => x.CreditId);
                    table.ForeignKey(
                        name: "FK_CarbonCredits_VerificationRequests_RequestId",
                        column: x => x.RequestId,
                        principalTable: "VerificationRequests",
                        principalColumn: "RequestId",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_AuditReports_RequestId",
                table: "AuditReports",
                column: "RequestId");

            migrationBuilder.CreateIndex(
                name: "IX_CarbonCredits_CreditSerialNumber",
                table: "CarbonCredits",
                column: "CreditSerialNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CarbonCredits_RequestId",
                table: "CarbonCredits",
                column: "RequestId");

            migrationBuilder.CreateIndex(
                name: "IX_EVJourneys_BatchId",
                table: "EVJourneys",
                column: "BatchId");

            migrationBuilder.CreateIndex(
                name: "IX_VerificationRequests_BatchId",
                table: "VerificationRequests",
                column: "BatchId");

            migrationBuilder.CreateIndex(
                name: "IX_VerificationRequests_StandardId",
                table: "VerificationRequests",
                column: "StandardId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AuditReports");

            migrationBuilder.DropTable(
                name: "CarbonCredits");

            migrationBuilder.DropTable(
                name: "EVJourneys");

            migrationBuilder.DropTable(
                name: "VerificationRequests");

            migrationBuilder.DropTable(
                name: "CVAStandards");

            migrationBuilder.DropTable(
                name: "JourneyBatches");
        }
    }
}
