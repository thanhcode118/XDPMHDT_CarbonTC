// triển khai của IVerificationProcessDomainService.
// Nó sẽ sử dụng các Repositories để lấy và lưu Entity, sử dụng EmissionCalculationDomainService để tính toán, và phát ra Domain Events
using System;
using System.Linq;
using System.Threading.Tasks;
using CarbonTC.CarbonLifecycle.Domain.Entities;
using CarbonTC.CarbonLifecycle.Domain.Enums;
using CarbonTC.CarbonLifecycle.Domain.Events;
using CarbonTC.CarbonLifecycle.Domain.Repositories;
using CarbonTC.CarbonLifecycle.Domain.ValueObjects;
using CarbonTC.CarbonLifecycle.Domain.Abstractions;

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
            _verificationRequestRepository = verificationRequestRepository ?? throw new ArgumentNullException(nameof(journeyBatchRepository));
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

            // Cập nhật trạng thái của JourneyBatch Entity - SỬ DỤNG DOMAIN BEHAVIOR
            batch.MarkAsSubmitted();
            await _journeyBatchRepository.UpdateAsync(batch);

            // Tạo VerificationRequest Entity mới - SỬ DỤNG FACTORY METHOD
            var newRequest = VerificationRequest.Create(journeyBatchId, requestorId, notes);

            await _verificationRequestRepository.AddAsync(newRequest);

            // Phát Domain Event
            await _eventDispatcher.Dispatch(new JourneyBatchSubmittedForVerificationEvent(batch.Id, requestorId));
            await _eventDispatcher.Dispatch(new VerificationRequestCreatedEvent(newRequest.Id, batch.Id, requestorId));

            return newRequest;
        }

        public async Task ApproveVerificationRequestAsync(
            Guid verificationRequestId,
            string CVAId,
            AuditFindings findings,
            string approvalNotes,
            CVAStandard cvaStandard)
        {
            var verificationRequest = await _verificationRequestRepository.GetByIdAsync(verificationRequestId);
            if (verificationRequest == null)
            {
                throw new InvalidOperationException($"VerificationRequest with ID {verificationRequestId} not found.");
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

            // Cập nhật VerificationRequest Entity - SỬ DỤNG DOMAIN BEHAVIOR
            verificationRequest.MarkAsApproved(CVAId, cvaStandard.Id, approvalNotes);
            await _verificationRequestRepository.UpdateAsync(verificationRequest);

            // Cập nhật JourneyBatch Entity - SỬ DỤNG DOMAIN BEHAVIOR
            batch.MarkAsVerified(DateTime.UtcNow);
            await _journeyBatchRepository.UpdateAsync(batch);

            // Tính toán và tạo Carbon Credits
            var (totalCO2, totalCredits) = await _emissionCalculationService.CalculateBatchCarbonCreditsAsync(batch, cvaStandard);

            if (totalCredits.Value > 0)
            {
                // Tạo Carbon Credit - DÙNG FACTORY METHOD CarbonCredit.Issue (Đã sửa ở D2.1)
                // DÒNG NÀY SẼ ĐƯỢC CẬP NHẬT Ở BƯỚC 10 (FIX BUILD ERROR)
                var newCarbonCredit = CarbonCredit.Issue(
                    journeyBatchId: batch.Id,
                    userId: batch.UserId,
                    amountKgCO2e: (decimal)totalCO2.ToKg().Value,
                    verificationRequestId: verificationRequestId
                );

                await _carbonCreditRepository.AddAsync(newCarbonCredit);

                // Cập nhật trạng thái JourneyBatch - SỬ DỤNG DOMAIN BEHAVIOR
                batch.MarkAsCreditsIssued();
                await _journeyBatchRepository.UpdateAsync(batch);

                // Phát Domain Event CarbonCreditsApproved (Sự kiện nội bộ)
                await _eventDispatcher.Dispatch(new CarbonCreditsApprovedEvent(
                    batch.Id,
                    batch.UserId,
                    newCarbonCredit.Id, // Lấy Id từ biến vừa tạo
                    totalCredits
                ));
            }
            else
            {
                // Nếu không có tín chỉ nào được tạo
                await _eventDispatcher.Dispatch(new CarbonCreditsRejectedEvent(batch.Id, CVAId, "No eligible carbon credits could be generated from batch."));
            }

            // Phát Domain Event VerificationRequestApproved
            await _eventDispatcher.Dispatch(new VerificationRequestApprovedEvent(verificationRequestId, batch.Id, CVAId));
        }

        public async Task RejectVerificationRequestAsync(
            Guid verificationRequestId,
            string CVAId,
            AuditFindings findings,
            string reason)
        {
            var verificationRequest = await _verificationRequestRepository.GetByIdAsync(verificationRequestId);
            if (verificationRequest == null)
            {
                throw new InvalidOperationException($"VerificationRequest with ID {verificationRequestId} not found.");
            }

            // Cập nhật VerificationRequest Entity - SỬ DỤNG DOMAIN BEHAVIOR
            verificationRequest.MarkAsRejected(CVAId, reason);
            await _verificationRequestRepository.UpdateAsync(verificationRequest);

            var batch = await _journeyBatchRepository.GetByIdAsync(verificationRequest.JourneyBatchId);
            if (batch == null)
            {
                throw new InvalidOperationException($"Associated JourneyBatch with ID {verificationRequest.JourneyBatchId} not found.");
            }

            // Cập nhật JourneyBatch Entity - SỬ DỤNG DOMAIN BEHAVIOR
            batch.MarkAsRejected();
            await _journeyBatchRepository.UpdateAsync(batch);

            // Phát Domain Event
            await _eventDispatcher.Dispatch(new CarbonCreditsRejectedEvent(batch.Id, CVAId, reason));
            await _eventDispatcher.Dispatch(new VerificationRequestRejectedEvent(verificationRequestId, batch.Id, CVAId, reason));
        }
    }
}