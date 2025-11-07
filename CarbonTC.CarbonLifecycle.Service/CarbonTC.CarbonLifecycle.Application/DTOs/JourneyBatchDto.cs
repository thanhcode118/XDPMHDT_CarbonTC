using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace CarbonTC.CarbonLifecycle.Application.DTOs
{
    // DTO trả về thông tin một lô
    public class JourneyBatchDto
    {
        public Guid Id { get; set; }
        public string OwnerId { get; set; } // Sẽ map từ UserId

        // Ghi chú: Entity JourneyBatch không có thuộc tính 'Name'
        // 'Name' có thể đến từ JourneyBatchCreateDto lúc tạo
        // Tạm thời chúng ta sẽ không map trường này từ entity
        // public string Name { get; set; } 

        public decimal TotalCarbonCredits { get; set; } // <-- Đổi sang decimal
        public string Status { get; set; }
        public List<EvJourneyResponseDto> Journeys { get; set; } = new List<EvJourneyResponseDto>();
    }
}
