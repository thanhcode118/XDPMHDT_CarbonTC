using MediatR;
using CarbonTC.CarbonLifecycle.Application.DTOs;
using System;

namespace CarbonTC.CarbonLifecycle.Application.Commands.CVAStandard
{
    // Trả về DTO của standard đã cập nhật
    public class UpdateCVAStandardCommand : IRequest<CvaStandardDto>
    {
        public Guid StandardId { get; } // Lấy ID từ route/query
        public CVAStandardUpdateDto UpdateData { get; }

        public UpdateCVAStandardCommand(Guid standardId, CVAStandardUpdateDto updateData)
        {
            StandardId = standardId;
            UpdateData = updateData ?? throw new ArgumentNullException(nameof(updateData));
        }
    }
}