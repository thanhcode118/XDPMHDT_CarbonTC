// File: CarbonTC.CarbonLifecycle.Application/Queries/CVAStandard/GetCVAStandardsQueryHandler.cs
using MediatR;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using CarbonTC.CarbonLifecycle.Domain.Repositories;
using CarbonTC.CarbonLifecycle.Application.DTOs;
using System.Linq; // Cần cho Where và OrderBy

namespace CarbonTC.CarbonLifecycle.Application.Queries.CVAStandard
{
    public class GetCVAStandardsQueryHandler : IRequestHandler<GetCVAStandardsQuery, IEnumerable<CvaStandardDto>>
    {
        private readonly ICVAStandardRepository _standardRepository;
        private readonly IMapper _mapper;

        public GetCVAStandardsQueryHandler(ICVAStandardRepository standardRepository, IMapper mapper)
        {
            _standardRepository = standardRepository;
            _mapper = mapper;
        }

        public async Task<IEnumerable<CvaStandardDto>> Handle(GetCVAStandardsQuery request, CancellationToken cancellationToken)
        {
            // Sử dụng phương thức GetAllAsync với filter IsActive
            var standards = await _standardRepository.GetAllAsync(request.IsActive);

            // Sắp xếp theo tên
            var orderedStandards = standards.OrderBy(s => s.StandardName);

            return _mapper.Map<IEnumerable<CvaStandardDto>>(orderedStandards);
        }
    }
}