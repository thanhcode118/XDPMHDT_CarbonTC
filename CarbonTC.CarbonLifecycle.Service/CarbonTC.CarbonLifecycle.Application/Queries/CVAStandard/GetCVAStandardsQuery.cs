// File: CarbonTC.CarbonLifecycle.Application/Queries/CVAStandard/GetCVAStandardsQuery.cs
using MediatR;
using CarbonTC.CarbonLifecycle.Application.DTOs;
using System.Collections.Generic;

namespace CarbonTC.CarbonLifecycle.Application.Queries.CVAStandard
{
    public class GetCVAStandardsQuery : IRequest<IEnumerable<CvaStandardDto>>
    {
        // Lọc theo trạng thái active (null = lấy tất cả)
        public bool? IsActive { get; set; }

        // Có thể thêm phân trang nếu danh sách quá lớn
        // public int PageNumber { get; set; } = 1;
        // public int PageSize { get; set; } = 20;
    }
}