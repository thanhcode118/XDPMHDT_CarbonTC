using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarbonTC.CarbonLifecycle.Application.DTOs
{
    // DTO cho việc upload một hành trình
    public class EvJourneyUploadDto
    {
        // Giả định bạn sẽ lấy OwnerId từ token (IdentityService)
        // Nếu bạn muốn client gửi lên, hãy thêm public string OwnerId { get; set; }
        public decimal DistanceKm { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string VehicleModel { get; set; } 
    }
}
