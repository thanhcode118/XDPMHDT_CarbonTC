using System;
using System.Collections.Generic;
using System.Threading.Tasks;
// File: CarbonTC.CarbonLifecycle.Domain/Repositories/IVerificationRequestRepository.cs
// ... (using statements)
using CarbonTC.CarbonLifecycle.Domain.Entities; // Cần entity

public interface IVerificationRequestRepository
{
    Task<VerificationRequest?> GetByIdAsync(Guid id); // Thêm ? để rõ ràng nullable
    Task<IEnumerable<VerificationRequest>> GetByJourneyBatchIdAsync(Guid journeyBatchId);
    Task AddAsync(VerificationRequest request);
    Task UpdateAsync(VerificationRequest request); // Sửa thành Task để nhất quán (dù EF Update là sync)
    Task DeleteAsync(Guid id);

    // --- BỔ SUNG ---
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

}