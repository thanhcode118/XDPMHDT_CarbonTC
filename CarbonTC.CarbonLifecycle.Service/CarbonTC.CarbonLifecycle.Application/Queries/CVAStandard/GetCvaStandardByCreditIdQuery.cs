using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CarbonTC.CarbonLifecycle.Application.DTOs;
using MediatR;

namespace CarbonTC.CarbonLifecycle.Application.Queries.CVAStandard
{
    // Query này trả về MỘT tiêu chuẩn CVA (CvaStandardDto)
    // liên quan trực tiếp đến một CreditId
    public class GetCvaStandardByCreditIdQuery : IRequest<CvaStandardDto>
    {
        public Guid CreditId { get; }

        public GetCvaStandardByCreditIdQuery(Guid creditId)
        {
            CreditId = creditId;
        }
    }
}