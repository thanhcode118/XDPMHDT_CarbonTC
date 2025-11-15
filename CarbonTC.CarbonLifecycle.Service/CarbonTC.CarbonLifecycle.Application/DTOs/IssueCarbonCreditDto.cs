using System;
using System.ComponentModel.DataAnnotations;

namespace CarbonTC.CarbonLifecycle.Application.DTOs
{
    /// <summary>
    /// DTO để phát hành tín chỉ carbon
    /// </summary>
    public class IssueCarbonCreditDto
    {
        /// <summary>
        /// Số lượng CO2e (kg) được phát hành (bắt buộc)
        /// </summary>
        [Required(ErrorMessage = "AmountKgCO2e is required.")]
        [Range(0.0001, double.MaxValue, ErrorMessage = "AmountKgCO2e must be greater than zero.")]
        public decimal AmountKgCO2e { get; set; }

        /// <summary>
        /// ID của người dùng sở hữu tín chỉ (optional - nếu không có sẽ lấy từ token hiện tại)
        /// </summary>
        public string? UserId { get; set; }

        /// <summary>
        /// ID của Journey Batch (optional - nếu phát hành từ batch đã verified)
        /// </summary>
        public Guid? JourneyBatchId { get; set; }
    }
}

