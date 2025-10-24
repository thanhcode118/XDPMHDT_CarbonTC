using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CarbonTC.CarbonLifecycle.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class UpdateSeedDataWithLinks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "CarbonCredits",
                keyColumn: "Id",
                keyValue: new Guid("abcdef12-3456-4abc-9def-abcdef123456"),
                column: "VerificationRequestId",
                value: new Guid("12345678-90ab-4cde-8fab-1234567890ab"));

            migrationBuilder.UpdateData(
                table: "VerificationRequests",
                keyColumn: "Id",
                keyValue: new Guid("12345678-90ab-4cde-8fab-1234567890ab"),
                column: "CvaStandardId",
                value: new Guid("d2a0a0f0-a3b0-4b10-8b7a-0a0a0a0a0a01"));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
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
        }
    }
}
