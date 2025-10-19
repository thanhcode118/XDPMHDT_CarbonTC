using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
namespace CarbonTC.CarbonLifecycle.Application.DTOs
{
    // DTO trả về thông tin một hành trình
    public class EvJourneyResponseDto
    {
        public Guid Id { get; set; }
        public string OwnerId { get; set; } // Sẽ map từ UserId
        public decimal DistanceKm { get; set; } // <-- Đổi sang decimal
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public decimal CalculatedCarbonCredits { get; set; } // <-- Đổi sang decimal
        public string Status { get; set; }
    }
}