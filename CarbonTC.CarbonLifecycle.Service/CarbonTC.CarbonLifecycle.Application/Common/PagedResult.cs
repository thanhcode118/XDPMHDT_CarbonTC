// File: CarbonTC.CarbonLifecycle.Application/Common/PagedResult.cs
using System;
using System.Collections.Generic;
using System.Linq;

namespace CarbonTC.CarbonLifecycle.Application.Common 
{
    public class PagedResult<T>
    {
        public List<T> Items { get; set; } = new();
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => PageSize > 0 ? (int)Math.Ceiling(TotalCount / (double)PageSize) : 0; // Tránh chia cho 0
        public bool HasPreviousPage => PageNumber > 1;
        public bool HasNextPage => PageNumber < TotalPages;

        // Constructor mặc định (nếu cần)
        public PagedResult() { }

        // Constructor tiện lợi (nếu cần)
        public PagedResult(List<T> items, int totalCount, int pageNumber, int pageSize)
        {
            Items = items;
            TotalCount = totalCount;
            PageNumber = pageNumber;
            PageSize = pageSize;
        }
    }
}