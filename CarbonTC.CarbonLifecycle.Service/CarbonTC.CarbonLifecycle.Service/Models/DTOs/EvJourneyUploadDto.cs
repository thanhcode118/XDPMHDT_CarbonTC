using Microsoft.AspNetCore.Http;

namespace CarbonTC.CarbonLifecycle.Service.Models.DTOs
{
    // DTO này được sử dụng khi EV Owner upload file dữ liệu hành trình.
    public class EvJourneyUploadDto
    {
        public Guid OwnerId { get; set; }

        public IFormFile JourneyDataFile { get; set; } // Dùng IFormFile để nhận file upload
    }
}