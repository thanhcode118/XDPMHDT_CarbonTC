using Application.Common.Features.Transactions.DTOs;
using Application.Common.Interfaces;
using ClosedXML.Excel;

namespace Infrastructure.Services
{
    public class ExcelService : IExcelService
    {
        public async Task<byte[]> ExportTransactionStatementAsync(
            List<TransactionDto> transactions,
            Guid currentUserId,
            DateTime startDate,
            DateTime endDate)
        {
            await Task.Yield();

            using var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add("Sao Ke Giao Dich");

            worksheet.Cell("A1").Value = "SAO KÊ GIAO DỊCH KHÁCH HÀNG";
            worksheet.Range("A1:F1").Merge().Style
                .Font.SetBold().Font.SetFontSize(16)
                .Alignment.SetHorizontal(XLAlignmentHorizontalValues.Center);

            worksheet.Cell("A2").Value = $"Từ ngày: {startDate:dd/MM/yyyy} - Đến ngày: {endDate:dd/MM/yyyy}";
            worksheet.Range("A2:F2").Merge().Style.Alignment.SetHorizontal(XLAlignmentHorizontalValues.Center);

            int headerRow = 4;
            var headers = new[] { "STT", "Mã Giao Dịch", "Thời Gian (VN)", "Loại GD", "Số Tiền (VNĐ)", "Tín Chỉ", "Trạng Thái" };

            for (int i = 0; i < headers.Length; i++)
            {
                var cell = worksheet.Cell(headerRow, i + 1);
                cell.Value = headers[i];
                cell.Style.Font.SetBold();
                cell.Style.Fill.SetBackgroundColor(XLColor.LightGray);
                cell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
                cell.Style.Alignment.SetHorizontal(XLAlignmentHorizontalValues.Center);
            }

            int currentRow = headerRow + 1;
            int stt = 1;

            decimal totalMoneyIn = 0;  
            decimal totalMoneyOut = 0;

            foreach (var txn in transactions)
            {
                worksheet.Cell(currentRow, 1).Value = stt++;
                worksheet.Cell(currentRow, 2).Value = txn.Id.ToString();

                var vnTime = txn.CreatedAt.ToUniversalTime().AddHours(7);
                worksheet.Cell(currentRow, 3).Value = vnTime;

                bool isExpense = (txn.BuyerId == currentUserId); 

                if (isExpense)
                {
                    worksheet.Cell(currentRow, 4).Value = "Thanh toán (Mua)";
                    worksheet.Cell(currentRow, 4).Style.Font.SetFontColor(XLColor.Red); 

                    worksheet.Cell(currentRow, 5).Value = -txn.TotalAmount;
                    worksheet.Cell(currentRow, 5).Style.Font.SetFontColor(XLColor.Red);

                    totalMoneyOut += txn.TotalAmount;
                }
                else
                {
                    worksheet.Cell(currentRow, 4).Value = "Nhận tiền (Bán)";
                    worksheet.Cell(currentRow, 4).Style.Font.SetFontColor(XLColor.Green); 

                    worksheet.Cell(currentRow, 5).Value = txn.TotalAmount;
                    worksheet.Cell(currentRow, 5).Style.Font.SetFontColor(XLColor.Green);

                    totalMoneyIn += txn.TotalAmount;
                }

                worksheet.Cell(currentRow, 6).Value = txn.Quantity;
                worksheet.Cell(currentRow, 7).Value = txn.Status.ToString();

                worksheet.Cell(currentRow, 3).Style.DateFormat.Format = "dd/MM/yyyy HH:mm";
                worksheet.Cell(currentRow, 5).Style.NumberFormat.Format = "#,##0";
                worksheet.Cell(currentRow, 6).Style.NumberFormat.Format = "#,##0";
                worksheet.Range(currentRow, 1, currentRow, 7).Style.Border.OutsideBorder = XLBorderStyleValues.Thin;

                currentRow++;
            }

            worksheet.Cell(currentRow + 1, 4).Value = "TỔNG THU:";
            worksheet.Cell(currentRow + 1, 5).Value = totalMoneyIn;
            worksheet.Cell(currentRow + 1, 5).Style.Font.SetBold().Font.SetFontColor(XLColor.Green).NumberFormat.Format = "#,##0";

            worksheet.Cell(currentRow + 2, 4).Value = "TỔNG CHI:";
            worksheet.Cell(currentRow + 2, 5).Value = totalMoneyOut;
            worksheet.Cell(currentRow + 2, 5).Style.Font.SetBold().Font.SetFontColor(XLColor.Red).NumberFormat.Format = "#,##0";

            worksheet.Columns().AdjustToContents();
            worksheet.Column(2).Width = 35;

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            return stream.ToArray();
        }
    }
}