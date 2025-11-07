using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using CarbonTC.CarbonLifecycle.Application.DTOs;
using CarbonTC.CarbonLifecycle.Domain.Repositories;
using MediatR;
using System.Threading;

namespace CarbonTC.CarbonLifecycle.Application.Queries.JourneyBatch
{
    public class GetJourneyBatchesByOwnerIdQueryHandler : IRequestHandler<GetJourneyBatchesByOwnerIdQuery, IEnumerable<JourneyBatchDto>>
    {
        private readonly IJourneyBatchRepository _batchRepository;
        private readonly IMapper _mapper;

        public GetJourneyBatchesByOwnerIdQueryHandler(IJourneyBatchRepository batchRepository, IMapper mapper)
        {
            _batchRepository = batchRepository;
            _mapper = mapper;
        }

        public async Task<IEnumerable<JourneyBatchDto>> Handle(GetJourneyBatchesByOwnerIdQuery request, CancellationToken cancellationToken)
        {
            // Dùng hàm đã xác nhận (để tối ưu)
            var batches = await _batchRepository.GetByOwnerIdWithJourneysAsync(request.OwnerId);

            // MappingProfile đã lo việc map list Journeys con
            return _mapper.Map<IEnumerable<JourneyBatchDto>>(batches);
        }
    }
}
