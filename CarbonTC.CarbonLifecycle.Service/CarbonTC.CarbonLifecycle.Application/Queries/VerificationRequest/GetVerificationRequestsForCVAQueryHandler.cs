// File: CarbonTC.CarbonLifecycle.Application/Queries/VerificationRequest/GetVerificationRequestsForCVAQueryHandler.cs
using MediatR;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using CarbonTC.CarbonLifecycle.Domain.Repositories;
using CarbonTC.CarbonLifecycle.Application.DTOs;
using CarbonTC.CarbonLifecycle.Application.Common;
using CarbonTC.CarbonLifecycle.Domain.Enums; // Cần VerificationRequestStatus
using System.Linq; // Cần cho LINQ
using System.Collections.Generic; // Cần cho List

namespace CarbonTC.CarbonLifecycle.Application.Queries.VerificationRequest
{
    // Sửa kiểu trả về thành PagedResult từ Application.Common
    public class GetVerificationRequestsForCVAQueryHandler
        : IRequestHandler<GetVerificationRequestsForCVAQuery, PagedResult<VerificationRequestSummaryDto>>
    {
        private readonly IVerificationRequestRepository _verificationRequestRepository;
        private readonly IMapper _mapper;

        public GetVerificationRequestsForCVAQueryHandler(IVerificationRequestRepository verificationRequestRepository, IMapper mapper)
        {
            _verificationRequestRepository = verificationRequestRepository;
            _mapper = mapper;
        }

        // Sửa kiểu trả về của phương thức Handle
        public async Task<PagedResult<VerificationRequestSummaryDto>> Handle(
            GetVerificationRequestsForCVAQuery request, CancellationToken cancellationToken)
        {
            // Sử dụng phương thức GetPendingWithPaginationAsync đã thêm vào Repository
            var (requests, totalCount) = await _verificationRequestRepository.GetPendingWithPaginationAsync(
                request.PageNumber, request.PageSize);

            // Mapper đã được cấu hình để map IEnumerable<VerificationRequest> sang List<VerificationRequestSummaryDto>
            var requestDtos = _mapper.Map<List<VerificationRequestSummaryDto>>(requests);

            // Tạo đối tượng PagedResult từ Application.Common
            return new PagedResult<VerificationRequestSummaryDto>
            {
                Items = requestDtos,
                TotalCount = totalCount,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize
            };
        }
    }
}