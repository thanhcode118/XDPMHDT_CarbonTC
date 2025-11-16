// interface cho dịch vụ quản lý các bước trong quá trình xác minh
using System;
using System.Threading.Tasks;
using CarbonTC.CarbonLifecycle.Domain.Entities;
using CarbonTC.CarbonLifecycle.Domain.Enums;
using CarbonTC.CarbonLifecycle.Domain.ValueObjects; // Để sử dụng AuditFindings, CreditAmount

namespace CarbonTC.CarbonLifecycle.Domain.Services
{
    public interface IVerificationProcessDomainService
    {
        // Gửi một JourneyBatch để xác minh
        Task<VerificationRequest> SubmitBatchForVerificationAsync(Guid journeyBatchId, string requestorId, string notes);

        // Phê duyệt một yêu cầu xác minh
        Task ApproveVerificationRequestAsync(
            Guid verificationRequestId,
            string CVAId,
            AuditFindings findings,
            string approvalNotes,
            CVAStandard cvaStandard); // Cần CVAStandard để tính toán tín chỉ

        // Từ chối một yêu cầu xác minh
        Task RejectVerificationRequestAsync(
            Guid verificationRequestId,
            string CVAId,
            AuditFindings findings,
            string reason);
    }
}