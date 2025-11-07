using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CarbonTC.CarbonLifecycle.Application.Services;
using CarbonTC.CarbonLifecycle.Domain.Entities;
using CarbonTC.CarbonLifecycle.Domain.Repositories;
using CarbonTC.CarbonLifecycle.Domain.Enums;
using MediatR;
using System.Threading;

namespace CarbonTC.CarbonLifecycle.Application.Commands.VerificationRequest
{
    public class SubmitVerificationRequestCommandHandler : IRequestHandler<SubmitVerificationRequestCommand, bool>
    {
        private readonly IJourneyBatchRepository _batchRepository;
        private readonly IVerificationRequestRepository _verificationRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IIdentityService _identityService;

        public SubmitVerificationRequestCommandHandler(
            IJourneyBatchRepository batchRepository,
            IVerificationRequestRepository verificationRepository,
            IUnitOfWork unitOfWork,
            IIdentityService identityService)
        {
            _batchRepository = batchRepository;
            _verificationRepository = verificationRepository;
            _unitOfWork = unitOfWork;
            _identityService = identityService;
        }

        public async Task<bool> Handle(SubmitVerificationRequestCommand request, CancellationToken cancellationToken)
        {
            var ownerId = _identityService.GetUserId();
            if (string.IsNullOrEmpty(ownerId))
            {
                throw new UnauthorizedAccessException("User is not authenticated.");
            }

            // 1. Lấy batch 
            var batch = await _batchRepository.GetByIdAndOwnerAsync(request.JourneyBatchId, ownerId);

            if (batch == null)
            {
                throw new KeyNotFoundException("Batch not found or access denied.");
            }
            if (batch.Status != JourneyBatchStatus.Pending)
            {
                throw new InvalidOperationException("Only 'Pending' batches can be submitted.");
            }

            // 2. Cập nhật trạng thái Batch - SỬ DỤNG DOMAIN BEHAVIOR
            batch.MarkAsSubmitted(); // Thay thế 2 dòng gán Status và LastModifiedAt
            await _batchRepository.UpdateAsync(batch); // Dùng hàm Update của Repo

            // 3. Tạo VerificationRequest - SỬ DỤNG FACTORY METHOD
            var verificationRequest = CarbonTC.CarbonLifecycle.Domain.Entities.VerificationRequest.Create(
                journeyBatchId: batch.Id,
                requestorId: ownerId,
                notes: "Submitted by user."
            );

            await _verificationRepository.AddAsync(verificationRequest);

            // 4. Lưu cả 2 thay đổi vào DB (đảm bảo transaction)
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}