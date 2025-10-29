// File: CarbonTC.CarbonLifecycle.Application/Commands/VerificationRequest/ReviewVerificationRequestCommand.cs
using MediatR;
using CarbonTC.CarbonLifecycle.Application.DTOs;
using System;

namespace CarbonTC.CarbonLifecycle.Application.Commands.VerificationRequest
{
    // Command này trả về boolean (thành công/thất bại) hoặc chi tiết VerificationRequestDto đã cập nhật
    public class ReviewVerificationRequestCommand : IRequest<VerificationRequestDto>
    {
        public VerificationRequestReviewDto ReviewData { get; }

        public ReviewVerificationRequestCommand(VerificationRequestReviewDto reviewData)
        {
            ReviewData = reviewData ?? throw new ArgumentNullException(nameof(reviewData));
        }
    }
}