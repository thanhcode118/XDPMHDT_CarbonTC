using CarbonTC.CarbonLifecycle.Application.DTOs;
using MediatR;
using System.Collections.Generic;

namespace CarbonTC.CarbonLifecycle.Application.Queries.JourneyBatch
{
    // Query này không cần tham số vì OwnerId sẽ lấy từ IdentityService
    public class GetMyJourneyBatchesQuery : IRequest<IEnumerable<JourneyBatchDto>>
    {
    }
}