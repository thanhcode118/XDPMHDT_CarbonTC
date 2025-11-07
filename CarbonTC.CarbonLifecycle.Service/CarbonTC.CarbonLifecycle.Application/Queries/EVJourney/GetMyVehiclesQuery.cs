using CarbonTC.CarbonLifecycle.Application.DTOs;
using MediatR;
using System.Collections.Generic;

namespace CarbonTC.CarbonLifecycle.Application.Queries.EVJourney
{
    /// <summary>
    /// Query để lấy danh sách phương tiện với thống kê tổng hợp
    /// </summary>
    public class GetMyVehiclesQuery : IRequest<IEnumerable<VehicleSummaryDto>>
    {
        public string OwnerId { get; }

        public GetMyVehiclesQuery(string ownerId)
        {
            OwnerId = ownerId;
        }
    }
}

