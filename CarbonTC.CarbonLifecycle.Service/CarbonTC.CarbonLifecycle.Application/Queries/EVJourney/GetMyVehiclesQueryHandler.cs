using CarbonTC.CarbonLifecycle.Application.DTOs;
using CarbonTC.CarbonLifecycle.Domain.Repositories;
using MediatR;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace CarbonTC.CarbonLifecycle.Application.Queries.EVJourney
{
    public class GetMyVehiclesQueryHandler : IRequestHandler<GetMyVehiclesQuery, IEnumerable<VehicleSummaryDto>>
    {
        private readonly IEVJourneyRepository _journeyRepository;

        public GetMyVehiclesQueryHandler(IEVJourneyRepository journeyRepository)
        {
            _journeyRepository = journeyRepository;
        }

        public async Task<IEnumerable<VehicleSummaryDto>> Handle(GetMyVehiclesQuery request, CancellationToken cancellationToken)
        {
            // Lấy tất cả hành trình của owner
            var journeys = await _journeyRepository.GetByOwnerIdAsync(request.OwnerId);

            // Group by VehicleType và tính toán thống kê
            var vehicleSummaries = journeys
                .GroupBy(j => j.VehicleType)
                .Select(g => new VehicleSummaryDto
                {
                    VehicleType = g.Key,
                    TotalJourneys = g.Count(),
                    TotalDistanceKm = g.Sum(j => j.DistanceKm),
                    TotalCarbonCredits = g.Sum(j => j.CO2EstimateKg),
                    FirstJourneyDate = g.Min(j => j.StartTime),
                    LastJourneyDate = g.Max(j => j.StartTime)
                })
                .OrderByDescending(v => v.LastJourneyDate) // Sắp xếp theo ngày hành trình cuối cùng
                .ToList();

            return vehicleSummaries;
        }
    }
}

