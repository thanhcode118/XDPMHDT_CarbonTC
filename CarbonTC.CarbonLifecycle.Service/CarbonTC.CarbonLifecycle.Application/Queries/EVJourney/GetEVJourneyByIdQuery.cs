using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CarbonTC.CarbonLifecycle.Application.DTOs;
using MediatR;

namespace CarbonTC.CarbonLifecycle.Application.Queries.EVJourney
{
    // Query này trả về một hành trình cụ thể
    public class GetEVJourneyByIdQuery : IRequest<EvJourneyResponseDto?>
    {
        public Guid JourneyId { get; }
        public string OwnerId { get; } // Thêm OwnerId để kiểm tra quyền

        public GetEVJourneyByIdQuery(Guid journeyId, string ownerId)
        {
            JourneyId = journeyId;
            OwnerId = ownerId;
        }
    }
}
