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
        public decimal DistanceKm { get; set; } 
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public decimal CalculatedCarbonCredits { get; set; } 
        public string Status { get; set; }
        
        // Thông tin xe điện
        public string VehicleType { get; set; } // Loại/model xe điện
        public string Origin { get; set; } // Điểm xuất phát
        public string Destination { get; set; } // Điểm đích
    }
}