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
using Microsoft.Extensions.Logging;

namespace CarbonTC.CarbonLifecycle.Application.Commands.VerificationRequest
{
    public class SubmitVerificationRequestCommandHandler : IRequestHandler<SubmitVerificationRequestCommand, bool>
    {
        private readonly IJourneyBatchRepository _batchRepository;
        private readonly IVerificationRequestRepository _verificationRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IIdentityService _identityService;
        private readonly ILogger<SubmitVerificationRequestCommandHandler> _logger;

        public SubmitVerificationRequestCommandHandler(
            IJourneyBatchRepository batchRepository,
            IVerificationRequestRepository verificationRepository,
            IUnitOfWork unitOfWork,
            IIdentityService identityService,
            ILogger<SubmitVerificationRequestCommandHandler> logger)
        {
            _batchRepository = batchRepository;
            _verificationRepository = verificationRepository;
            _unitOfWork = unitOfWork;
            _identityService = identityService;
            _logger = logger;
        }

        public async Task<bool> Handle(SubmitVerificationRequestCommand request, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Starting submit verification request for batch ID: {BatchId}", request.JourneyBatchId);

            var ownerId = _identityService.GetUserId();
            _logger.LogInformation("Current user ID from token: {OwnerId}", ownerId ?? "NULL");

            if (string.IsNullOrEmpty(ownerId))
            {
                _logger.LogWarning("User is not authenticated - GetUserId returned null or empty");
                throw new UnauthorizedAccessException("User is not authenticated.");
            }

            // 1. Kiểm tra batch có tồn tại không (không kiểm tra quyền sở hữu)
            _logger.LogInformation("Attempting to find batch with ID: {BatchId}", request.JourneyBatchId);
            var batch = await _batchRepository.GetByIdAsync(request.JourneyBatchId);

            if (batch == null)
            {
                _logger.LogWarning("Batch not found in database. BatchId: {BatchId}, CurrentUserId: {UserId}", 
                    request.JourneyBatchId, ownerId);
                throw new KeyNotFoundException($"Batch with ID {request.JourneyBatchId} not found.");
            }

            // Chuẩn hóa UserId để so sánh (trim và loại bỏ khoảng trắng)
            var normalizedBatchUserId = batch.UserId?.Trim() ?? string.Empty;
            var normalizedOwnerId = ownerId?.Trim() ?? string.Empty;

            _logger.LogInformation("Batch found. BatchId: {BatchId}, BatchUserId: '{BatchUserId}' (normalized: '{NormalizedBatchUserId}'), CurrentUserId: '{CurrentUserId}' (normalized: '{NormalizedOwnerId}'), Status: {Status}",
                batch.Id, batch.UserId, normalizedBatchUserId, ownerId, normalizedOwnerId, batch.Status);

            // 2. Kiểm tra quyền sở hữu - so sánh UserId với ownerId hiện tại
            // Sử dụng StringComparison.OrdinalIgnoreCase để tránh vấn đề về case sensitivity
            // Và so sánh sau khi đã normalize (trim)
            if (!string.Equals(normalizedBatchUserId, normalizedOwnerId, StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogWarning("Access denied - UserId mismatch. BatchUserId: '{BatchUserId}' (length: {BatchUserIdLength}), CurrentUserId: '{CurrentUserId}' (length: {CurrentUserIdLength})",
                    batch.UserId, batch.UserId?.Length ?? 0, ownerId, ownerId?.Length ?? 0);
                
                // Log thêm thông tin để debug
                _logger.LogWarning("BatchUserId bytes: {BatchUserIdBytes}, CurrentUserId bytes: {CurrentUserIdBytes}",
                    string.Join(", ", batch.UserId?.Select(c => (int)c) ?? Array.Empty<int>()),
                    string.Join(", ", ownerId?.Select(c => (int)c) ?? Array.Empty<int>()));
                
                throw new UnauthorizedAccessException($"Access denied. You are not the owner of this batch. Batch belongs to user: '{batch.UserId}', but current user is: '{ownerId}'");
            }

            // 3. Kiểm tra trạng thái batch
            if (batch.Status != JourneyBatchStatus.Pending)
            {
                _logger.LogWarning("Batch status is not Pending. Current status: {Status}", batch.Status);
                throw new InvalidOperationException($"Only 'Pending' batches can be submitted. Current status: {batch.Status}.");
            }

            _logger.LogInformation("All validation passed. Proceeding to submit batch.");

            // 4. Cập nhật trạng thái Batch - SỬ DỤNG DOMAIN BEHAVIOR
            batch.MarkAsSubmitted(); // Thay thế 2 dòng gán Status và LastModifiedAt
            await _batchRepository.UpdateAsync(batch); // Dùng hàm Update của Repo
            _logger.LogInformation("Batch status updated to SubmittedForVerification");

            // 5. Tạo VerificationRequest - SỬ DỤNG FACTORY METHOD
            var verificationRequest = CarbonTC.CarbonLifecycle.Domain.Entities.VerificationRequest.Create(
                journeyBatchId: batch.Id,
                requestorId: ownerId,
                notes: "Submitted by user."
            );

            await _verificationRepository.AddAsync(verificationRequest);
            _logger.LogInformation("VerificationRequest created. RequestId: {RequestId}", verificationRequest.Id);

            // 6. Lưu cả 2 thay đổi vào DB (đảm bảo transaction)
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            _logger.LogInformation("Changes saved successfully. Batch submitted for verification.");

            return true;
        }
    }
}