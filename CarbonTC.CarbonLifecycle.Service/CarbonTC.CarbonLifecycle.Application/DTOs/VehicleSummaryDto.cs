using System;

namespace CarbonTC.CarbonLifecycle.Application.DTOs
{
    /// <summary>
    /// DTO trả về thống kê tổng hợp cho một phương tiện
    /// </summary>
    public class VehicleSummaryDto
    {
        public string VehicleType { get; set; } = string.Empty; // Loại/model xe điện
        public int TotalJourneys { get; set; } // Tổng số hành trình
        public decimal TotalDistanceKm { get; set; } // Tổng quãng đường (km)
        public decimal TotalCarbonCredits { get; set; } // Tổng carbon credits
        public DateTime? FirstJourneyDate { get; set; } // Ngày hành trình đầu tiên
        public DateTime? LastJourneyDate { get; set; } // Ngày hành trình cuối cùng
    }
}

