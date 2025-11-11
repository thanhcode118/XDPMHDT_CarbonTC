using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CarbonTC.CarbonLifecycle.Domain.Entities;
using CarbonTC.CarbonLifecycle.Domain.Enums;

public interface IVerificationRequestRepository
{
    Task<VerificationRequest?> GetByIdAsync(Guid id);
    Task<IEnumerable<VerificationRequest>> GetByJourneyBatchIdAsync(Guid journeyBatchId);
    Task AddAsync(VerificationRequest request);
    Task UpdateAsync(VerificationRequest request);
    Task DeleteAsync(Guid id);

    /// <summary>
    /// Lấy tất cả các yêu cầu đang chờ xử lý (Pending).
    /// Cân nhắc thay thế bằng phương thức có phân trang.
    /// </summary>
    Task<IEnumerable<VerificationRequest>> GetAllPendingAsync();

    /// <summary>
    /// Lấy các yêu cầu đang chờ xử lý với phân trang.
    /// </summary>
    /// <param name="pageNumber">Số trang (bắt đầu từ 1).</param>
    /// <param name="pageSize">Số lượng mục trên mỗi trang.</param>
    /// <returns>Tuple chứa danh sách các request trên trang và tổng số lượng request đang chờ.</returns>
    Task<(IEnumerable<VerificationRequest> Items, int TotalCount)> GetPendingWithPaginationAsync(int pageNumber, int pageSize);

    /// <summary>
    /// Lấy các yêu cầu theo status với phân trang.
    /// </summary>
    /// <param name="status">Status của request (Pending, Approved, Rejected, InProgress).</param>
    /// <param name="pageNumber">Số trang (bắt đầu từ 1).</param>
    /// <param name="pageSize">Số lượng mục trên mỗi trang.</param>
    /// <returns>Tuple chứa danh sách các request trên trang và tổng số lượng request.</returns>
    Task<(IEnumerable<VerificationRequest> Items, int TotalCount)> GetByStatusWithPaginationAsync(VerificationRequestStatus status, int pageNumber, int pageSize);

}