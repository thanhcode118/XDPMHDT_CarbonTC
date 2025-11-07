// File: CarbonTC.CarbonLifecycle.Application/Queries/VerificationRequest/GetVerificationRequestByIdQuery.cs
using MediatR;
using CarbonTC.CarbonLifecycle.Application.DTOs;
using System;

namespace CarbonTC.CarbonLifecycle.Application.Queries.VerificationRequest
{
    // Trả về DTO chi tiết hoặc null nếu không tìm thấy
    public class GetVerificationRequestByIdQuery : IRequest<VerificationRequestDto?>
    {
        public Guid VerificationRequestId { get; }

        public GetVerificationRequestByIdQuery(Guid verificationRequestId)
        {
            VerificationRequestId = verificationRequestId;
        }
    }
}