using System;
using MediatR;
using CarbonTC.CarbonLifecycle.Application.DTOs;

namespace CarbonTC.CarbonLifecycle.Application.Queries.CVAStandard
{
    // Query này trả về MỘT tiêu chuẩn CVA (CvaStandardDto)
    public class GetCVAStandardByIdQuery : IRequest<CvaStandardDto?>
    {
        public Guid StandardId { get; }

        public GetCVAStandardByIdQuery(Guid standardId)
        {
            StandardId = standardId;
        }
    }
}