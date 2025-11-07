// File: CarbonTC.CarbonLifecycle.Application/Queries/VerificationRequest/GetVerificationRequestsForCVAQuery.cs
using MediatR;
using CarbonTC.CarbonLifecycle.Application.DTOs;
using CarbonTC.CarbonLifecycle.Application.Common;
using System.ComponentModel.DataAnnotations;

namespace CarbonTC.CarbonLifecycle.Application.Queries.VerificationRequest
{
    // Sửa kiểu trả về thành PagedResult từ Application.Common
    public class GetVerificationRequestsForCVAQuery : IRequest<PagedResult<VerificationRequestSummaryDto>>
    {
        [Range(1, int.MaxValue, ErrorMessage = "Page number must be at least 1.")]
        public int PageNumber { get; set; } = 1;

        [Range(1, 100, ErrorMessage = "Page size must be between 1 and 100.")]
        public int PageSize { get; set; } = 10;

        // Có thể thêm các tham số filter khác ở đây nếu cần (vd: RequestorId, DateRange)
    }
}