using System;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using MediatR;
using CarbonTC.CarbonLifecycle.Application.DTOs;
using CarbonTC.CarbonLifecycle.Domain.Repositories;

namespace CarbonTC.CarbonLifecycle.Application.Queries.CVAStandard
{
    public class GetCVAStandardByIdQueryHandler : IRequestHandler<GetCVAStandardByIdQuery, CvaStandardDto?>
    {
        private readonly ICVAStandardRepository _standardRepository;
        private readonly IMapper _mapper;

        public GetCVAStandardByIdQueryHandler(ICVAStandardRepository standardRepository, IMapper mapper)
        {
            _standardRepository = standardRepository;
            _mapper = mapper;
        }

        public async Task<CvaStandardDto?> Handle(GetCVAStandardByIdQuery request, CancellationToken cancellationToken)
        {
            // Sử dụng Repository để lấy Entity
            var standard = await _standardRepository.GetByIdAsync(request.StandardId);

            if (standard == null)
            {
                return null;
            }

            // Map Entity sang DTO và trả về
            return _mapper.Map<CvaStandardDto>(standard);
        }
    }
}