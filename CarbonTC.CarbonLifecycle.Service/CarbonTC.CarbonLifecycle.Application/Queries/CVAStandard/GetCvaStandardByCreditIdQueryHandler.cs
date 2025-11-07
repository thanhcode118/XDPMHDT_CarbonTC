using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Threading;
using AutoMapper;
using CarbonTC.CarbonLifecycle.Application.DTOs;
using CarbonTC.CarbonLifecycle.Domain.Repositories;
using MediatR;

namespace CarbonTC.CarbonLifecycle.Application.Queries.CVAStandard
{
    public class GetCvaStandardByCreditIdQueryHandler : IRequestHandler<GetCvaStandardByCreditIdQuery, CvaStandardDto>
    {
        private readonly ICarbonCreditRepository _carbonCreditRepository;
        private readonly IVerificationRequestRepository _verificationRepository;
        private readonly IMapper _mapper;

        public GetCvaStandardByCreditIdQueryHandler(
            ICarbonCreditRepository carbonCreditRepository,
            IVerificationRequestRepository verificationRepository,
            IMapper mapper)
        {
            _carbonCreditRepository = carbonCreditRepository;
            _verificationRepository = verificationRepository;
            _mapper = mapper;
        }

        public async Task<CvaStandardDto> Handle(GetCvaStandardByCreditIdQuery request, CancellationToken cancellationToken)
        {
            // 1. Lấy CarbonCredit (đã include VerificationRequest)
            var credit = await _carbonCreditRepository.GetByIdAsync(request.CreditId);

            // 2. Kiểm tra xem credit có tồn tại và có liên kết đến VerificationRequest không
            if (credit == null || !credit.VerificationRequestId.HasValue)
            {
                // Không tìm thấy credit hoặc credit này không đến từ 1 verification
                return null;
            }

            // 3. Lấy VerificationRequest (đã include CvaStandard)
            var verificationRequest = await _verificationRepository.GetByIdAsync(credit.VerificationRequestId.Value);

            // 4. Kiểm tra xem request có tồn tại và có liên kết đến Standard không
            if (verificationRequest == null || verificationRequest.CvaStandard == null)
            {
                // Request không có standard (có thể chưa được duyệt)
                return null;
            }

            // 5. Map CvaStandard (entity) sang CvaStandardDto
            return _mapper.Map<CvaStandardDto>(verificationRequest.CvaStandard);
        }
    }
}
