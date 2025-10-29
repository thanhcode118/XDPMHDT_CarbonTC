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
            // TODO: Thêm phương thức GetAllAsync(bool? isActive) vào ICVAStandardRepository và implement
            // Giả sử nó trả về IEnumerable<Domain.Entities.CVAStandard>

            // var standards = await _standardRepository.GetAllAsync(request.IsActive);

            // Tạm thời implement logic filter ở đây
            IEnumerable<Domain.Entities.CVAStandard> standards;
            if (request.IsActive.HasValue)
            {
                if (request.IsActive.Value)
                {
                    standards = await _standardRepository.GetAllActiveStandardsAsync(); // Dùng hàm có sẵn
                }
                else
                {
                    // Cần hàm lấy non-active hoặc GetAll rồi filter
                    // Giả sử có GetAllAsync()
                    // standards = (await _standardRepository.GetAllAsync()).Where(s => !s.IsActive);
                    standards = new List<Domain.Entities.CVAStandard>(); // Tạm thời trả rỗng
                }
            }
            else
            {
                // Lấy tất cả, cần hàm GetAllAsync()
                // standards = await _standardRepository.GetAllAsync();
                standards = await _standardRepository.GetAllActiveStandardsAsync(); // Tạm thời chỉ lấy active
            }


            var orderedStandards = standards.OrderBy(s => s.StandardName); // Sắp xếp

            return _mapper.Map<IEnumerable<CvaStandardDto>>(orderedStandards);
        }
    }
}