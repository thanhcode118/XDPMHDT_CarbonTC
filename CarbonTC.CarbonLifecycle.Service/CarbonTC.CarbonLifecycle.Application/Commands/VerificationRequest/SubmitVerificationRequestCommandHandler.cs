using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CarbonTC.CarbonLifecycle.Application.Services;
using CarbonTC.CarbonLifecycle.Domain.Entities;
using CarbonTC.CarbonLifecycle.Domain.Repositories;
using CarbonTC.CarbonLifecycle.Domain.Enums; // Dùng Enums
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
                throw new Exception("User is not authenticated.");
            }

            // 1. Lấy batch (Dùng hàm đã xác nhận)
            var batch = await _batchRepository.GetByIdAndOwnerAsync(request.JourneyBatchId, ownerId);

            if (batch == null)
            {
                throw new Exception("Batch not found or access denied.");
            }
            if (batch.Status != JourneyBatchStatus.Pending)
            {
                throw new Exception("Only 'Pending' batches can be submitted.");
            }

            // 2. Cập nhật trạng thái Batch
            batch.Status = JourneyBatchStatus.SubmittedForVerification; // Enum bạn cung cấp
            batch.LastModifiedAt = DateTime.UtcNow;
            await _batchRepository.UpdateAsync(batch); // Dùng hàm Update của Repo

            // 3. Tạo VerificationRequest
            var verificationRequest = new CarbonTC.CarbonLifecycle.Domain.Entities.VerificationRequest
            {
                Id = Guid.NewGuid(),
                JourneyBatchId = batch.Id,
                RequestorId = ownerId,
                RequestDate = DateTime.UtcNow,
                Status = VerificationRequestStatus.Pending, // Enum bạn cung cấp
                Notes = "Submitted by user."
            };

            await _verificationRepository.AddAsync(verificationRequest);

            // 4. Lưu cả 2 thay đổi vào DB (đảm bảo transaction)
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}