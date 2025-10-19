// triển khai của IVerificationProcessDomainService.
// Nó sẽ sử dụng các Repositories để lấy và lưu Entity, sử dụng EmissionCalculationDomainService để tính toán, và phát ra Domain Events
using System;
using System.Linq;
using System.Threading.Tasks;
using CarbonTC.CarbonLifecycle.Domain.Entities;
using CarbonTC.CarbonLifecycle.Domain.Enums;
using CarbonTC.CarbonLifecycle.Domain.Events; // Cần include namespace này
using CarbonTC.CarbonLifecycle.Domain.Repositories;
using CarbonTC.CarbonLifecycle.Domain.ValueObjects;
using CarbonTC.CarbonLifecycle.Application.Abstractions; // Để sử dụng IDomainEventDispatcher


namespace CarbonTC.CarbonLifecycle.Domain.Services
{
    public class VerificationProcessDomainService : IVerificationProcessDomainService
    {
        private readonly IJourneyBatchRepository _journeyBatchRepository;
        private readonly IVerificationRequestRepository _verificationRequestRepository;
        private readonly ICarbonCreditRepository _carbonCreditRepository;
        private readonly ICVAStandardRepository _cvaStandardRepository;
        private readonly IEmissionCalculationDomainService _emissionCalculationService;
        private readonly IDomainEventDispatcher _eventDispatcher; // Inject IDomainEventDispatcher

        public VerificationProcessDomainService(
            IJourneyBatchRepository journeyBatchRepository,
            IVerificationRequestRepository verificationRequestRepository,
            ICarbonCreditRepository carbonCreditRepository,
            ICVAStandardRepository cvaStandardRepository,
            IEmissionCalculationDomainService emissionCalculationService,
            IDomainEventDispatcher eventDispatcher) // Nhận IDomainEventDispatcher qua constructor
        {
            _journeyBatchRepository = journeyBatchRepository ?? throw new ArgumentNullException(nameof(journeyBatchRepository));
            _verificationRequestRepository = verificationRequestRepository ?? throw new ArgumentNullException(nameof(verificationRequestRepository));
            _carbonCreditRepository = carbonCreditRepository ?? throw new ArgumentNullException(nameof(carbonCreditRepository));
            _cvaStandardRepository = cvaStandardRepository ?? throw new ArgumentNullException(nameof(cvaStandardRepository));
            _emissionCalculationService = emissionCalculationService ?? throw new ArgumentNullException(nameof(emissionCalculationService));
            _eventDispatcher = eventDispatcher ?? throw new ArgumentNullException(nameof(eventDispatcher));
        }

        public async Task<VerificationRequest> SubmitBatchForVerificationAsync(Guid journeyBatchId, string requestorId, string notes)
        {
            var batch = await _journeyBatchRepository.GetByIdWithDetailsAsync(journeyBatchId);
            if (batch == null)
            {
                throw new InvalidOperationException($"JourneyBatch with ID {journeyBatchId} not found.");
            }

            if (batch.Status != JourneyBatchStatus.Pending && batch.Status != JourneyBatchStatus.Rejected)
            {
                throw new InvalidOperationException("Only pending or rejected batches can be submitted for verification.");
            }

            if (!batch.EVJourneys.Any())
            {
                throw new InvalidOperationException("Cannot submit an empty batch for verification.");
            }

            // Tạo VerificationRequest Entity mới
            var newRequest = new VerificationRequest
            {
                Id = Guid.NewGuid(),
                JourneyBatchId = journeyBatchId,
                RequestorId = requestorId,
                RequestDate = DateTime.UtcNow,
                Status = VerificationRequestStatus.Pending,
                Notes = notes,
                CreatedAt = DateTime.UtcNow,
                // AuditFindings hiện là một string (hoặc có thể là JSON string) trong Entity gốc
                // Nếu bạn muốn lưu AuditFindings Value Object, bạn sẽ cần serialize nó thành string
                // hoặc sửa đổi Entity để nó chấp nhận Value Object (nhưng chúng ta đang tránh điều đó)
                // Vì vậy, tạm thời chúng ta không gán AuditFindings Value Object vào đây.
                // Nếu AuditFindings là một string trong Entity:
                // AuditFindings = new AuditFindings("Initial request", new List<string>(), true).ToString();
            };

            await _verificationRequestRepository.AddAsync(newRequest);

            // Cập nhật trạng thái của JourneyBatch Entity
            batch.Status = JourneyBatchStatus.SubmittedForVerification;
            batch.LastModifiedAt = DateTime.UtcNow; // Cập nhật thủ công LastModifiedAt
            await _journeyBatchRepository.UpdateAsync(batch);

            // Phát Domain Event
            await _eventDispatcher.Dispatch(new JourneyBatchSubmittedForVerificationEvent(batch.Id, requestorId));
            await _eventDispatcher.Dispatch(new VerificationRequestCreatedEvent(newRequest.Id, batch.Id, requestorId));

            return newRequest;
        }

        public async Task ApproveVerificationRequestAsync(
            Guid verificationRequestId,
            string verifierId,
            AuditFindings findings, // Input là Value Object
            string approvalNotes,
            CVAStandard cvaStandard)
        {
            var verificationRequest = await _verificationRequestRepository.GetByIdAsync(verificationRequestId);
            if (verificationRequest == null)
            {
                throw new InvalidOperationException($"VerificationRequest with ID {verificationRequestId} not found.");
            }

            if (verificationRequest.Status != VerificationRequestStatus.Pending)
            {
                throw new InvalidOperationException("Cannot approve a request that is not pending.");
            }

            var batch = await _journeyBatchRepository.GetByIdWithDetailsAsync(verificationRequest.JourneyBatchId);
            if (batch == null)
            {
                throw new InvalidOperationException($"Associated JourneyBatch with ID {verificationRequest.JourneyBatchId} not found.");
            }

            if (cvaStandard == null)
            {
                throw new ArgumentNullException(nameof(cvaStandard), "CVA Standard is required for credit generation.");
            }

            // Cập nhật VerificationRequest Entity
            verificationRequest.VerifierId = verifierId;
            verificationRequest.VerificationDate = DateTime.UtcNow;
            verificationRequest.Status = VerificationRequestStatus.Approved;
            // Nếu AuditFindings trong Entity là string, bạn sẽ cần chuyển đổi Value Object sang string (ví dụ: JSON)
            // verificationRequest.AuditFindings = JsonConvert.SerializeObject(findings);
            // Hiện tại, AuditFindings trong Entity là string, tôi sẽ gán trực tiếp summary hoặc serialize nó nếu muốn đầy đủ
            verificationRequest.Notes = approvalNotes ?? verificationRequest.Notes; // Cập nhật Notes
            verificationRequest.LastModifiedAt = DateTime.UtcNow;
            await _verificationRequestRepository.UpdateAsync(verificationRequest);

            // Cập nhật JourneyBatch Entity
            batch.Status = JourneyBatchStatus.Verified;
            batch.VerificationTime = DateTime.UtcNow;
            batch.LastModifiedAt = DateTime.UtcNow;

            // Tính toán và tạo Carbon Credits
            var (totalCO2, totalCredits) = await _emissionCalculationService.CalculateBatchCarbonCreditsAsync(batch, cvaStandard);

            if (totalCredits.Value > 0)
            {
                // Tạo CarbonCredit Entity mới
                var newCarbonCredit = new CarbonCredit
                {
                    Id = Guid.NewGuid(),
                    JourneyBatchId = batch.Id,
                    UserId = batch.UserId,
                    // Gán lại giá trị primitive từ Value Object vào Entity
                    AmountKgCO2e = (decimal)totalCO2.ToKg().Value,
                    // Giả định Entity CarbonCredit có một trường cho CreditAmount (decimal hoặc int)
                    // Hoặc bạn sẽ cần chuyển CreditAmount Value Object sang một giá trị primitive
                    // Ví dụ: Amount = totalCredits.Value; (Nếu có trường 'Amount' dạng int/decimal)
                    // Dựa trên CarbonCredit.cs ban đầu, bạn có AmountKgCO2e, không có Amount cho Credits
                    // Nếu muốn lưu CreditAmount vào Entity, bạn cần thêm một trường decimal/int vào Entity CarbonCredit
                    // Ví dụ: public int CreditCount { get; set; }
                    // Sau đó gán: CreditCount = totalCredits.Value;
                    // Tạm thời, tôi sẽ không gán CreditAmount vào Entity CarbonCredit để không sửa Entity.
                    // Nếu bạn thêm CreditAmount vào Entity, hãy bảo tôi nhé.

                    IssueDate = DateTime.UtcNow,
                    ExpiryDate = null,
                    Status = CarbonCreditStatus.Issued,
                    TransactionHash = null,
                    CreatedAt = DateTime.UtcNow
                };
                await _carbonCreditRepository.AddAsync(newCarbonCredit);

                // Cập nhật trạng thái JourneyBatch
                batch.Status = JourneyBatchStatus.CreditsIssued;
                batch.LastModifiedAt = DateTime.UtcNow;

                // Phát Domain Event CarbonCreditsApproved
                await _eventDispatcher.Dispatch(new CarbonCreditsApprovedEvent(batch.Id, batch.UserId, totalCredits));
            }
            else
            {
                // Nếu không có tín chỉ nào được tạo
                await _eventDispatcher.Dispatch(new CarbonCreditsRejectedEvent(batch.Id, verifierId, "No eligible carbon credits could be generated from batch."));
            }

            await _journeyBatchRepository.UpdateAsync(batch); // Lưu các thay đổi của batch

            // Phát Domain Event VerificationRequestApproved
            await _eventDispatcher.Dispatch(new VerificationRequestApprovedEvent(verificationRequestId, batch.Id, verifierId));
        }

        public async Task RejectVerificationRequestAsync(
            Guid verificationRequestId,
            string verifierId,
            AuditFindings findings, // Input là Value Object
            string reason)
        {
            var verificationRequest = await _verificationRequestRepository.GetByIdAsync(verificationRequestId);
            if (verificationRequest == null)
            {
                throw new InvalidOperationException($"VerificationRequest with ID {verificationRequestId} not found.");
            }

            if (verificationRequest.Status != VerificationRequestStatus.Pending)
            {
                throw new InvalidOperationException("Cannot reject a request that is not pending.");
            }

            var batch = await _journeyBatchRepository.GetByIdAsync(verificationRequest.JourneyBatchId);
            if (batch == null)
            {
                throw new InvalidOperationException($"Associated JourneyBatch with ID {verificationRequest.JourneyBatchId} not found.");
            }

            // Cập nhật VerificationRequest Entity
            verificationRequest.VerifierId = verifierId;
            verificationRequest.VerificationDate = DateTime.UtcNow;
            verificationRequest.Status = VerificationRequestStatus.Rejected;
            // Chuyển đổi AuditFindings Value Object sang string nếu Entity cần string
            // verificationRequest.AuditFindings = JsonConvert.SerializeObject(findings);
            verificationRequest.Notes = reason ?? verificationRequest.Notes; // Ghi lý do từ chối
            verificationRequest.LastModifiedAt = DateTime.UtcNow;
            await _verificationRequestRepository.UpdateAsync(verificationRequest);

            // Cập nhật JourneyBatch Entity
            batch.Status = JourneyBatchStatus.Rejected;
            batch.LastModifiedAt = DateTime.UtcNow;
            await _journeyBatchRepository.UpdateAsync(batch);

            // Phát Domain Event
            await _eventDispatcher.Dispatch(new CarbonCreditsRejectedEvent(batch.Id, verifierId, reason));
            await _eventDispatcher.Dispatch(new VerificationRequestRejectedEvent(verificationRequestId, batch.Id, verifierId, reason));
        }
    }
}