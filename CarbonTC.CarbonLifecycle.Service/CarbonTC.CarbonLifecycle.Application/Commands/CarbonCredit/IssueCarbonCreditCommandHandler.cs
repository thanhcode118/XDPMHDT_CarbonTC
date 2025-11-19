using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Logging;
using CarbonTC.CarbonLifecycle.Domain.Repositories;
using CarbonTC.CarbonLifecycle.Application.DTOs;
using CarbonTC.CarbonLifecycle.Application.Services;
using CarbonTC.CarbonLifecycle.Domain.Enums;
using CarbonTC.CarbonLifecycle.Domain.Abstractions;
using CarbonTC.CarbonLifecycle.Domain.Events;
using DomainEntities = CarbonTC.CarbonLifecycle.Domain.Entities;

namespace CarbonTC.CarbonLifecycle.Application.Commands.CarbonCredit
{
    public class IssueCarbonCreditCommandHandler : IRequestHandler<IssueCarbonCreditCommand, CarbonCreditDto>
    {
        private readonly ICarbonCreditRepository _carbonCreditRepository;
        private readonly IJourneyBatchRepository _journeyBatchRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ILogger<IssueCarbonCreditCommandHandler> _logger;
        private readonly IIdentityService _identityService;
        private readonly IDomainEventDispatcher _eventDispatcher;

        public IssueCarbonCreditCommandHandler(
            ICarbonCreditRepository carbonCreditRepository,
            IJourneyBatchRepository journeyBatchRepository,
            IUnitOfWork unitOfWork,
            IMapper mapper,
            ILogger<IssueCarbonCreditCommandHandler> logger,
            IIdentityService identityService,
            IDomainEventDispatcher eventDispatcher)
        {
            _carbonCreditRepository = carbonCreditRepository;
            _journeyBatchRepository = journeyBatchRepository;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _logger = logger;
            _identityService = identityService;
            _eventDispatcher = eventDispatcher;
        }

        public async Task<CarbonCreditDto> Handle(IssueCarbonCreditCommand request, CancellationToken cancellationToken)
        {
            var issueData = request.IssueData;

            // Validate AmountKgCO2e (đã được validate bởi DataAnnotations nhưng kiểm tra lại để an toàn)
            if (issueData.AmountKgCO2e <= 0)
            {
                throw new ArgumentException("AmountKgCO2e must be greater than zero.", nameof(issueData.AmountKgCO2e));
            }

            // Lấy thông tin user hiện tại
            var currentUserId = _identityService.GetUserId();
            if (string.IsNullOrWhiteSpace(currentUserId))
            {
                throw new UnauthorizedAccessException("User is not authenticated.");
            }

            // Kiểm tra role của user
            var isAdmin = _identityService.IsInRole("Admin");
            var isCVA = _identityService.IsInRole("CVA");
            var isEVOwner = _identityService.IsInRole("EVOwner");

            _logger.LogInformation("Processing carbon credit issuance. CurrentUserId: {CurrentUserId}, IsAdmin: {IsAdmin}, IsCVA: {IsCVA}, IsEVOwner: {IsEVOwner}",
                currentUserId, isAdmin, isCVA, isEVOwner);

            // Xác định userId để phát hành credit
            var userId = issueData.UserId;
            if (string.IsNullOrWhiteSpace(userId))
            {
                // Nếu không có userId trong request, dùng userId từ token
                userId = currentUserId;
                _logger.LogInformation("UserId not provided in request, using authenticated user: {UserId}", userId);
            }
            else
            {
                // Nếu có userId trong request, chỉ Admin và CVA mới được phát hành cho user khác
                if (!isAdmin && !isCVA && userId != currentUserId)
                {
                    throw new UnauthorizedAccessException("Only Admin and CVA can issue credits for other users.");
                }
            }

            _logger.LogInformation("Processing carbon credit issuance for UserId: {UserId}, Amount: {Amount} kg CO2e",
                userId, issueData.AmountKgCO2e);

            // Xử lý JourneyBatchId
            DomainEntities.JourneyBatch? batch = null;
            Guid journeyBatchId;

            if (issueData.JourneyBatchId.HasValue)
            {
                // Nếu có JourneyBatchId, kiểm tra batch tồn tại và đã verified
                batch = await _journeyBatchRepository.GetByIdAsync(issueData.JourneyBatchId.Value);
                if (batch == null)
                {
                    throw new KeyNotFoundException($"JourneyBatch with ID {issueData.JourneyBatchId.Value} not found.");
                }

                // Kiểm tra quyền sở hữu: EVOwner chỉ có thể phát hành từ batch của chính họ
                // CVA và Admin có thể phát hành từ batch của bất kỳ user nào
                if (isEVOwner && !isAdmin && !isCVA && batch.UserId != currentUserId)
                {
                    throw new UnauthorizedAccessException(
                        $"You can only issue credits from your own batches. This batch belongs to user: {batch.UserId}.");
                }

                // Kiểm tra batch đã được verified hoặc đã phát hành credits
                if (batch.Status != JourneyBatchStatus.Verified && batch.Status != JourneyBatchStatus.CreditsIssued)
                {
                    throw new InvalidOperationException(
                        $"Cannot issue credit for batch in status {batch.Status}. Batch must be Verified or CreditsIssued.");
                }

                // Đảm bảo userId khớp với batch owner (nếu không phải Admin hoặc CVA)
                if (!isAdmin && !isCVA && batch.UserId != userId)
                {
                    throw new UnauthorizedAccessException(
                        $"UserId {userId} does not match the batch owner {batch.UserId}.");
                }

                journeyBatchId = issueData.JourneyBatchId.Value;
            }
            else
            {
                // Nếu không có JourneyBatchId
                if (isEVOwner && !isAdmin && !isCVA)
                {
                    // EVOwner phải có JourneyBatchId để phát hành từ batch đã verified
                    // CVA và Admin có thể tạo batch mới để phát hành trực tiếp
                    throw new ArgumentException("JourneyBatchId is required for EVOwner. You can only issue credits from verified batches.");
                }

                // Admin và CVA có thể tạo batch mới để phát hành trực tiếp
                _logger.LogInformation("No JourneyBatchId provided. Creating a new batch for direct credit issuance (Admin/CVA only).");
                batch = DomainEntities.JourneyBatch.Create(userId);
                await _journeyBatchRepository.AddAsync(batch);
                journeyBatchId = batch.Id;
                _logger.LogInformation("Created new JourneyBatch with ID: {BatchId} for direct credit issuance", batch.Id);
            }

            // Tạo Carbon Credit với các giá trị mặc định
            var newCarbonCredit = DomainEntities.CarbonCredit.Issue(
                journeyBatchId: journeyBatchId,
                userId: userId,
                amountKgCO2e: issueData.AmountKgCO2e,
                verificationRequestId: null, // Không có verification request cho phát hành trực tiếp
                transactionHash: "pending_wallet_tx", // Mặc định
                expiryDate: null // Không có expiry date mặc định
            );

            // Lưu vào database
            await _carbonCreditRepository.AddAsync(newCarbonCredit);

            // Cập nhật trạng thái batch
            if (batch != null)
            {
                // Nếu batch đã ở trạng thái Verified, đánh dấu là CreditsIssued
                if (batch.Status == JourneyBatchStatus.Verified)
                {
                    batch.MarkAsCreditsIssued();
                    await _journeyBatchRepository.UpdateAsync(batch);
                }
                // Nếu batch mới tạo (Pending) hoặc chưa có trạng thái CreditsIssued, 
                // sử dụng method phát hành trực tiếp
                else if (batch.Status != JourneyBatchStatus.CreditsIssued)
                {
                    batch.MarkAsCreditsIssuedDirectly();
                    await _journeyBatchRepository.UpdateAsync(batch);
                }
            }

            // Save changes
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Carbon Credit issued successfully. CreditId: {CreditId}, UserId: {UserId}, Amount: {Amount} kg CO2e",
                newCarbonCredit.Id, newCarbonCredit.UserId, newCarbonCredit.AmountKgCO2e);

            // Phát Domain Event CarbonCreditIssuedEvent
            // Integration Events sẽ được phát hành tự động thông qua CarbonCreditIssuedIntegrationEventHandler
            await _eventDispatcher.Dispatch(new CarbonCreditIssuedEvent(
                journeyBatchId: journeyBatchId,
                userId: newCarbonCredit.UserId,
                creditId: newCarbonCredit.Id,
                amountKgCO2e: newCarbonCredit.AmountKgCO2e
            ));

            _logger.LogInformation("CarbonCreditIssuedEvent dispatched for CreditId: {CreditId}. Integration events will be published automatically.",
                newCarbonCredit.Id);

            // Map và trả về DTO
            return _mapper.Map<CarbonCreditDto>(newCarbonCredit);
        }
    }
}

