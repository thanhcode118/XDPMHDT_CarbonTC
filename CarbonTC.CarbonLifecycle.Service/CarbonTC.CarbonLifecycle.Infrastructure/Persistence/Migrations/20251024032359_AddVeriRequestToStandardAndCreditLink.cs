using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CarbonTC.CarbonLifecycle.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddVeriRequestToStandardAndCreditLink : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "CvaStandardId",
                table: "VerificationRequests",
                type: "char(36)",
                nullable: true,
                collation: "ascii_general_ci");

            migrationBuilder.AddColumn<Guid>(
                name: "VerificationRequestId",
                table: "CarbonCredits",
                type: "char(36)",
                nullable: true,
                collation: "ascii_general_ci");

            migrationBuilder.UpdateData(
                table: "CarbonCredits",
                keyColumn: "Id",
                keyValue: new Guid("abcdef12-3456-4abc-9def-abcdef123456"),
                column: "VerificationRequestId",
                value: null);

            migrationBuilder.UpdateData(
                table: "VerificationRequests",
                keyColumn: "Id",
                keyValue: new Guid("12345678-90ab-4cde-8fab-1234567890ab"),
                column: "CvaStandardId",
                value: null);

            migrationBuilder.CreateIndex(
                name: "IX_VerificationRequests_CvaStandardId",
                table: "VerificationRequests",
                column: "CvaStandardId");

            migrationBuilder.CreateIndex(
                name: "IX_CarbonCredits_VerificationRequestId",
                table: "CarbonCredits",
                column: "VerificationRequestId");

            migrationBuilder.AddForeignKey(
                name: "FK_CarbonCredits_VerificationRequests_VerificationRequestId",
                table: "CarbonCredits",
                column: "VerificationRequestId",
                principalTable: "VerificationRequests",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_VerificationRequests_CVAStandards_CvaStandardId",
                table: "VerificationRequests",
                column: "CvaStandardId",
                principalTable: "CVAStandards",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CarbonCredits_VerificationRequests_VerificationRequestId",
                table: "CarbonCredits");

            migrationBuilder.DropForeignKey(
                name: "FK_VerificationRequests_CVAStandards_CvaStandardId",
                table: "VerificationRequests");

            migrationBuilder.DropIndex(
                name: "IX_VerificationRequests_CvaStandardId",
                table: "VerificationRequests");

            migrationBuilder.DropIndex(
                name: "IX_CarbonCredits_VerificationRequestId",
                table: "CarbonCredits");

            migrationBuilder.DropColumn(
                name: "CvaStandardId",
                table: "VerificationRequests");

            migrationBuilder.DropColumn(
                name: "VerificationRequestId",
                table: "CarbonCredits");
        }
    }
}
