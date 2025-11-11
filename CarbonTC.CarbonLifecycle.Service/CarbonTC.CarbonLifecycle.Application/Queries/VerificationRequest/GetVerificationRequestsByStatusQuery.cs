// File: CarbonTC.CarbonLifecycle.Application/Queries/VerificationRequest/GetVerificationRequestsByStatusQuery.cs
using MediatR;
using CarbonTC.CarbonLifecycle.Application.DTOs;
using CarbonTC.CarbonLifecycle.Application.Common;
using CarbonTC.CarbonLifecycle.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace CarbonTC.CarbonLifecycle.Application.Queries.VerificationRequest
{
    public class GetVerificationRequestsByStatusQuery : IRequest<PagedResult<VerificationRequestSummaryDto>>
    {
        [Required(ErrorMessage = "Status is required.")]
        public VerificationRequestStatus Status { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Page number must be at least 1.")]
        public int PageNumber { get; set; } = 1;

        [Range(1, 100, ErrorMessage = "Page size must be between 1 and 100.")]
        public int PageSize { get; set; } = 10;
    }
}

