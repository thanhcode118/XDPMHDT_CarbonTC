using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using CarbonTC.CarbonLifecycle.Application.DTOs;
using CarbonTC.CarbonLifecycle.Domain.Repositories; 
using MediatR;

namespace CarbonTC.CarbonLifecycle.Application.Queries.CarbonCredit
{
    public class GetCarbonCreditsByUserIdQueryHandler : IRequestHandler<GetCarbonCreditsByUserIdQuery, IEnumerable<CarbonCreditDto>>
    {
        private readonly ICarbonCreditRepository _carbonCreditRepository;
        private readonly IMapper _mapper;

        public GetCarbonCreditsByUserIdQueryHandler(ICarbonCreditRepository carbonCreditRepository, IMapper mapper)
        {
            _carbonCreditRepository = carbonCreditRepository;
            _mapper = mapper;
        }

        public async Task<IEnumerable<CarbonCreditDto>> Handle(GetCarbonCreditsByUserIdQuery request, CancellationToken cancellationToken)
        {
            // 1. Gọi Repository 
            var carbonCredits = await _carbonCreditRepository.GetByUserIdAsync(request.UserId);

            // 2. Map từ Entity sang DTO
            var carbonCreditDtos = _mapper.Map<IEnumerable<CarbonCreditDto>>(carbonCredits);

            return carbonCreditDtos;
        }
    }
}