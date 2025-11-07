using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CarbonTC.CarbonLifecycle.Application.DTOs;
using MediatR;
using System.Collections.Generic;

namespace CarbonTC.CarbonLifecycle.Application.Queries.JourneyBatch
{
    // Query này trả về một danh sách các lô
    public class GetJourneyBatchesByOwnerIdQuery : IRequest<IEnumerable<JourneyBatchDto>>
    {
        public string OwnerId { get; }

        public GetJourneyBatchesByOwnerIdQuery(string ownerId)
        {
            OwnerId = ownerId;
        }
    }
}
