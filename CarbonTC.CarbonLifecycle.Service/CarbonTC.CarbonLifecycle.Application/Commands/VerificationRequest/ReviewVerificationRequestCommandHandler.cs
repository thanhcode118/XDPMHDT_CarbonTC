using MediatR;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using CarbonTC.CarbonLifecycle.Domain.Repositories;
using CarbonTC.CarbonLifecycle.Domain.Services;
using CarbonTC.CarbonLifecycle.Domain.ValueObjects;
using CarbonTC.CarbonLifecycle.Domain.Enums;
using CarbonTC.CarbonLifecycle.Application.DTOs;
using CarbonTC.CarbonLifecycle.Application.Services;
using CarbonTC.CarbonLifecycle.Application.Abstractions.Services;
using CarbonTC.CarbonLifecycle.Application.Commands.AuditReport;
using CarbonTC.CarbonLifecycle.Domain.Entities;
using CarbonTC.CarbonLifecycle.Application.IntegrationEvents;
using CarbonTC.CarbonLifecycle.Application.Abstractions.Messaging;

namespace CarbonTC.CarbonLifecycle.Application.Commands.VerificationRequest
{
    public class ReviewVerificationRequestCommandHandler : IRequestHandler<ReviewVerificationRequestCommand, VerificationRequestDto>
    {
        private readonly IVerificationRequestRepository _verificationRequestRepository;
        private readonly IJourneyBatchRepository _journeyBatchRepository; // Cần để lấy thông tin batch
        private readonly ICarbonCreditRepository _carbonCreditRepository;
        private readonly ICVAStandardRepository _cvaStandardRepository;
        private readonly IVerificationProcessDomainService _verificationProcessDomainService;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IIdentityService _identityService;
        private readonly IMapper _mapper;
        private readonly ILogger<ReviewVerificationRequestCommandHandler> _logger;
        private readonly IMediator _mediator; // Inject Mediator để gửi Audit command
        private readonly IMessagePublisher _messagePublisher;

        // Bỏ IWalletService vì chúng ta dùng Event-Driven
        // private readonly IWalletService _walletService;

        public ReviewVerificationRequestCommandHandler(
            IVerificationRequestRepository verificationRequestRepository,
            IJourneyBatchRepository journeyBatchRepository,
            ICVAStandardRepository cvaStandardRepository,
            IVerificationProcessDomainService verificationProcessDomainService,
            IUnitOfWork unitOfWork,
            IIdentityService identityService,
            IMapper mapper,
            ILogger<ReviewVerificationRequestCommandHandler> logger,
            IMediator mediator,
            IMessagePublisher messagePublisher,
            ICarbonCreditRepository carbonCreditRepository
            /* IWalletService walletService */)
        {
            _verificationRequestRepository = verificationRequestRepository;
            _journeyBatchRepository = journeyBatchRepository;
            _cvaStandardRepository = cvaStandardRepository;
            _verificationProcessDomainService = verificationProcessDomainService;
            _unitOfWork = unitOfWork;
            _identityService = identityService;
            _mapper = mapper;
            _logger = logger;
            _mediator = mediator;
            _messagePublisher = messagePublisher;
            _carbonCreditRepository = carbonCreditRepository;
            // _walletService = walletService;
        }

        public async Task<VerificationRequestDto> Handle(ReviewVerificationRequestCommand request, CancellationToken cancellationToken)
        {
            var reviewData = request.ReviewData;
            var verifierId = _identityService.GetUserId();
            // TODO: Kiểm tra Role của verifierId có phải là CVA không? (Có thể làm ở Controller hoặc Middleware)
            if (string.IsNullOrEmpty(verifierId))
            {
                _logger.LogError("Verifier ID could not be retrieved from identity service.");
                throw new UnauthorizedAccessException("User is not authenticated or authorized.");
            }

            _logger.LogInformation("Processing review for VerificationRequest ID: {VerificationRequestId} by Verifier: {VerifierId}",
                reviewData.VerificationRequestId, verifierId);

            // 1. Lấy VerificationRequest gốc (bao gồm JourneyBatch và Standard nếu có)
            var verificationRequest = await _verificationRequestRepository.GetByIdAsync(reviewData.VerificationRequestId);
            if (verificationRequest == null)
            {
                _logger.LogWarning("VerificationRequest not found: {VerificationRequestId}", reviewData.VerificationRequestId);
                throw new KeyNotFoundException($"VerificationRequest with ID {reviewData.VerificationRequestId} not found.");
            }

            // Kiểm tra trạng thái có phải là Pending không
            if (verificationRequest.Status != VerificationRequestStatus.Pending)
            {
                _logger.LogWarning("VerificationRequest {VerificationRequestId} is not in Pending state. Current state: {Status}",
                    verificationRequest.Id, verificationRequest.Status);
                throw new InvalidOperationException($"Cannot review a request that is not in '{VerificationRequestStatus.Pending}' status.");
            }

            // Chụp lại trạng thái cũ để ghi audit
            var originalStatus = verificationRequest.Status;
            var originalValuesJson = JsonSerializer.Serialize(new { verificationRequest.Status, verificationRequest.Notes });

            // 2. Tạo đối tượng AuditFindings từ DTO
            var auditFindings = new AuditFindings(
                reviewData.AuditSummary,
                reviewData.AuditIssues ?? new List<string>(),
                reviewData.IsAuditSatisfactory);

            // 3. Xử lý logic Duyệt hoặc Từ chối
            if (reviewData.IsApproved)
            {
                // --- Logic Duyệt ---
                _logger.LogInformation("Approving VerificationRequest: {VerificationRequestId}", verificationRequest.Id);

                // Validate CvaStandardId phải có khi duyệt
                if (!reviewData.CvaStandardId.HasValue)
                {
                    throw new ArgumentException("CVA Standard ID must be provided when approving a request.", nameof(reviewData.CvaStandardId));
                }

                // Lấy CVAStandard entity
                var cvaStandard = await _cvaStandardRepository.GetByIdAsync(reviewData.CvaStandardId.Value);
                if (cvaStandard == null)
                {
                    throw new KeyNotFoundException($"CVA Standard with ID {reviewData.CvaStandardId.Value} not found.");
                }
                // TODO: Có thể thêm kiểm tra xem standard có Active không?

                // Gọi Domain Service để xử lý nghiệp vụ duyệt
                await _verificationProcessDomainService.ApproveVerificationRequestAsync(
                    verificationRequest.Id,
                    verifierId,
                    auditFindings,
                    reviewData.Notes,
                    cvaStandard); // Truyền standard đã lấy

                // Domain Service đã phát hành event CarbonCreditsApprovedEvent
                // Wallet Service sẽ lắng nghe event đó để mint credits.
                // Handler này KHÔNG cần gọi IWalletService trực tiếp.

                _logger.LogInformation("Successfully approved VerificationRequest: {VerificationRequestId}. CarbonCreditsApprovedEvent dispatched.", verificationRequest.Id);
            }
            else
            {
                // --- Logic Từ chối ---
                _logger.LogInformation("Rejecting VerificationRequest: {VerificationRequestId}", verificationRequest.Id);

                // Validate ReasonForRejection phải có khi từ chối
                if (string.IsNullOrWhiteSpace(reviewData.ReasonForRejection))
                {
                    throw new ArgumentException("Reason for rejection must be provided when rejecting a request.", nameof(reviewData.ReasonForRejection));
                }

                // Gọi Domain Service để xử lý nghiệp vụ từ chối
                await _verificationProcessDomainService.RejectVerificationRequestAsync(
                    verificationRequest.Id,
                    verifierId,
                    auditFindings,
                    reviewData.ReasonForRejection); // Truyền lý do

                // Domain Service đã phát hành event CarbonCreditsRejectedEvent

                _logger.LogInformation("Successfully rejected VerificationRequest: {VerificationRequestId}. CarbonCreditsRejectedEvent dispatched.", verificationRequest.Id);
            }

            // 4. Lưu thay đổi vào DB (cập nhật status của Request và Batch)
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // THÊM LOGIC PUBLISH SAU KHI SAVE THÀNH CÔNG
            if (reviewData.IsApproved)
            {
                // Truy vấn lại Credit vừa tạo ra (Giả định 1 Batch chỉ tạo ra 1 Credit)
                var newCredits = await _carbonCreditRepository.GetByVerificationRequestIdAsync(verificationRequest.Id);
                var newCredit = newCredits.FirstOrDefault();

                if (newCredit != null)
                {
                    // 1. Gửi CreditIssuedIntegrationEvent (Service Payment)
                    var creditIssuedEvent = new CreditIssuedIntegrationEvent
                    {
                        OwnerUserId = newCredit.UserId,
                        CreditAmount = newCredit.AmountKgCO2e,
                        ReferenceId = verificationRequest.JourneyBatchId.ToString(), // Dùng Batch ID làm Reference
                        IssuedAt = new DateTimeOffset(newCredit.IssueDate, TimeSpan.Zero),
                    };
                    // Routing Key: credit.issued
                    _ = _messagePublisher.PublishIntegrationEventAsync(creditIssuedEvent, "credit.issued");

                    // 2. Gửi CreditInventoryUpdateIntegrationEvent (Service Marketplace/Trading)
                    var inventoryUpdateEvent = new CreditInventoryUpdateIntegrationEvent
                    {
                        CreditId = newCredit.Id,
                        TotalAmount = newCredit.AmountKgCO2e,
                    };
                    // Routing Key: credit.inventory.update
                    _ = _messagePublisher.PublishIntegrationEventAsync(inventoryUpdateEvent, "credit.inventory.update"); 

                    _logger.LogInformation("Integration events published successfully for Credit ID: {CreditId}", newCredit.Id);
                }
                else
                {
                    _logger.LogError("Carbon Credit entity not found after approval for VerificationRequestId: {VerificationRequestId}", verificationRequest.Id);
                }
            }

            // 5. Ghi Audit Log (sau khi SaveChanges thành công)
            var newValuesJson = JsonSerializer.Serialize(new { verificationRequest.Status, verificationRequest.Notes });
            var auditCommand = new CreateAuditReportCommand(new AuditReportCreateDto
            {
                EntityType = nameof(VerificationRequest),
                EntityId = verificationRequest.Id,
                Action = reviewData.IsApproved ? "Approved" : "Rejected",
                OriginalValuesJson = originalValuesJson,
                NewValuesJson = newValuesJson
            });
            // Gửi command để tạo audit report (không cần await nếu không bắt buộc phải hoàn thành ngay)
            _ = _mediator.Send(auditCommand, cancellationToken);


            // 6. Map kết quả trả về (lấy lại entity đã cập nhật nếu cần)
            // Lấy lại để đảm bảo có trạng thái mới nhất và các quan hệ (nếu mapper cần)
            var updatedVerificationRequest = await _verificationRequestRepository.GetByIdAsync(verificationRequest.Id);
            return _mapper.Map<VerificationRequestDto>(updatedVerificationRequest);
        }
    }
}