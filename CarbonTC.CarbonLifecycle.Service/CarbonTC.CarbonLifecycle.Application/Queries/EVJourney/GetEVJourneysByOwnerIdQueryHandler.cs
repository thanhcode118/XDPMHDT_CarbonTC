using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using AutoMapper;
using CarbonTC.CarbonLifecycle.Application.DTOs;
using CarbonTC.CarbonLifecycle.Domain.Repositories;
using MediatR;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace CarbonTC.CarbonLifecycle.Application.Queries.EVJourney
{
    public class GetEVJourneysByOwnerIdQueryHandler : IRequestHandler<GetEVJourneysByOwnerIdQuery, IEnumerable<EvJourneyResponseDto>>
    {
        private readonly IEVJourneyRepository _journeyRepository;
        private readonly IMapper _mapper;

        public GetEVJourneysByOwnerIdQueryHandler(IEVJourneyRepository journeyRepository, IMapper mapper)
        {
            _journeyRepository = journeyRepository;
            _mapper = mapper;
        }

        public async Task<IEnumerable<EvJourneyResponseDto>> Handle(GetEVJourneysByOwnerIdQuery request, CancellationToken cancellationToken)
        {
            // Dùng hàm đã xác nhận
            var journeys = await _journeyRepository.GetByOwnerIdAsync(request.OwnerId);
            return _mapper.Map<IEnumerable<EvJourneyResponseDto>>(journeys);
        }
    }
}