using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CarbonTC.CarbonLifecycle.Application.DTOs;
using MediatR;
using System.Collections.Generic;

namespace CarbonTC.CarbonLifecycle.Application.Queries.EVJourney
{
    // Query này trả về một danh sách các hành trình
    public class GetEVJourneysByOwnerIdQuery : IRequest<IEnumerable<EvJourneyResponseDto>>
    {
        public string OwnerId { get; }

        public GetEVJourneysByOwnerIdQuery(string ownerId)
        {
            OwnerId = ownerId;
        }
    }
}