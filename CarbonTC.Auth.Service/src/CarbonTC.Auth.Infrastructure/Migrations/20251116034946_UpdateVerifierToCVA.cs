using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CarbonTC.Auth.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateVerifierToCVA : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"),
                columns: new[] { "Name", "Description" },
                values: new object[] { "CVA", "Cơ quan xác minh carbon - Xác minh tính hợp lệ của tín chỉ carbon" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"),
                columns: new[] { "Name", "Description" },
                values: new object[] { "Verifier", "Tổ chức xác minh - Xác minh tính hợp lệ của tín chỉ carbon" });
        }
    }
}