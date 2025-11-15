// File: CarbonTC.CarbonLifecycle.Application/Queries/VerificationRequest/GetVerificationRequestsByStatusQueryHandler.cs
using MediatR;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using CarbonTC.CarbonLifecycle.Domain.Repositories;
using CarbonTC.CarbonLifecycle.Application.DTOs;
using CarbonTC.CarbonLifecycle.Application.Common;
using System.Linq;
using System.Collections.Generic;

namespace CarbonTC.CarbonLifecycle.Application.Queries.VerificationRequest
{
    public class GetVerificationRequestsByStatusQueryHandler
        : IRequestHandler<GetVerificationRequestsByStatusQuery, PagedResult<VerificationRequestSummaryDto>>
    {
        private readonly IVerificationRequestRepository _verificationRequestRepository;
        private readonly IMapper _mapper;

        public GetVerificationRequestsByStatusQueryHandler(IVerificationRequestRepository verificationRequestRepository, IMapper mapper)
        {
            _verificationRequestRepository = verificationRequestRepository;
            _mapper = mapper;
        }

        public async Task<PagedResult<VerificationRequestSummaryDto>> Handle(
            GetVerificationRequestsByStatusQuery request, CancellationToken cancellationToken)
        {
            var (requests, totalCount) = await _verificationRequestRepository.GetByStatusWithPaginationAsync(
                request.Status, request.PageNumber, request.PageSize);

            var requestDtos = _mapper.Map<List<VerificationRequestSummaryDto>>(requests);

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

