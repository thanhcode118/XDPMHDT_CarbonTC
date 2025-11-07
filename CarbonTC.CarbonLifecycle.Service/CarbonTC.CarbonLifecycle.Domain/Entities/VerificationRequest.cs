using System;
using System.Collections.Generic;
using CarbonTC.CarbonLifecycle.Domain.Enums;

namespace CarbonTC.CarbonLifecycle.Domain.Entities
{
    public class VerificationRequest : BaseEntity
    {
        public Guid Id { get; private set; }
        public Guid JourneyBatchId { get; private set; }
        public string RequestorId { get; private set; }
        public string VerifierId { get; private set; }
        public DateTime RequestDate { get; private set; }
        public DateTime? VerificationDate { get; private set; }
        public VerificationRequestStatus Status { get; private set; }
        public string Notes { get; private set; }

        public Guid? CvaStandardId { get; private set; }

        // Navigation properties giữ public set cho EF Core
        public JourneyBatch JourneyBatch { get; set; }

        public CVAStandard CvaStandard { get; set; }
        public ICollection<CarbonCredit> CarbonCredits { get; set; }

        // Private constructor cho EF Core và Serialization
        private VerificationRequest()
        {
            RequestorId = string.Empty;
            VerifierId = string.Empty;
            Notes = string.Empty;
            CarbonCredits = new List<CarbonCredit>();
        }

        // Factory Method (hoặc Constructor) để khởi tạo ban đầu
        public static VerificationRequest Create(Guid journeyBatchId, string requestorId, string notes)
        {
            if (string.IsNullOrWhiteSpace(requestorId))
                throw new ArgumentException("Requestor ID cannot be empty.", nameof(requestorId));

            return new VerificationRequest
            {
                Id = Guid.NewGuid(),
                JourneyBatchId = journeyBatchId,
                RequestorId = requestorId,
                RequestDate = DateTime.UtcNow,
                Status = VerificationRequestStatus.Pending,
                Notes = notes ?? string.Empty,
                VerifierId = string.Empty,
            };
        }

        // Behavior Method 1: Phê duyệt yêu cầu
        public void MarkAsApproved(string verifierId, Guid cvaStandardId, string notes)
        {
            if (Status != VerificationRequestStatus.Pending)
            {
                throw new InvalidOperationException($"Cannot approve a request that is in status {Status}.");
            }
            if (string.IsNullOrWhiteSpace(verifierId))
            {
                throw new ArgumentException("Verifier ID cannot be empty.", nameof(verifierId));
            }
            if (cvaStandardId == Guid.Empty)
            {
                throw new ArgumentException("CVA Standard ID must be provided.", nameof(cvaStandardId));
            }

            VerifierId = verifierId;
            CvaStandardId = cvaStandardId;
            VerificationDate = DateTime.UtcNow;
            Status = VerificationRequestStatus.Approved;
            Notes = notes ?? Notes; // Cập nhật notes nếu có
            LastModifiedAt = DateTime.UtcNow;
        }

        // Behavior Method 2: Từ chối yêu cầu
        public void MarkAsRejected(string verifierId, string reason)
        {
            if (Status != VerificationRequestStatus.Pending)
            {
                throw new InvalidOperationException($"Cannot reject a request that is in status {Status}.");
            }
            if (string.IsNullOrWhiteSpace(verifierId))
            {
                throw new ArgumentException("Verifier ID cannot be empty.", nameof(verifierId));
            }
            if (string.IsNullOrWhiteSpace(reason))
            {
                throw new ArgumentException("Rejection reason must be provided.", nameof(reason));
            }

            VerifierId = verifierId;
            VerificationDate = DateTime.UtcNow;
            Status = VerificationRequestStatus.Rejected;
            Notes = reason; // Gán lý do từ chối vào Notes
            LastModifiedAt = DateTime.UtcNow;
        }
    }
}