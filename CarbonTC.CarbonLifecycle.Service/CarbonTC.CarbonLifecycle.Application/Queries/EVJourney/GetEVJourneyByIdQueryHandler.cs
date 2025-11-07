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

namespace CarbonTC.CarbonLifecycle.Application.Queries.EVJourney
{
    public class GetEVJourneyByIdQueryHandler : IRequestHandler<GetEVJourneyByIdQuery, EvJourneyResponseDto?>
    {
        private readonly IEVJourneyRepository _journeyRepository;
        private readonly IMapper _mapper;

        public GetEVJourneyByIdQueryHandler(IEVJourneyRepository journeyRepository, IMapper mapper)
        {
            _journeyRepository = journeyRepository;
            _mapper = mapper;
        }

        public async Task<EvJourneyResponseDto?> Handle(GetEVJourneyByIdQuery request, CancellationToken cancellationToken)
        {
            // Dùng hàm đã xác nhận (để kiểm tra bảo mật)
            var journey = await _journeyRepository.GetByIdAndOwnerAsync(request.JourneyId, request.OwnerId);

            if (journey == null)
            {
                return null; // Không tìm thấy hoặc không có quyền
            }

            return _mapper.Map<EvJourneyResponseDto>(journey);
        }
    }
}
