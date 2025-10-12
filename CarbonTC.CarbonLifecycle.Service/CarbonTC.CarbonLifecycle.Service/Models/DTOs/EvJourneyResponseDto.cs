namespace CarbonTC.CarbonLifecycle.Service.Models.DTOs
{
    // DTO này dùng để trả về thông tin chi tiết của một hành trình.
    public class EvJourneyResponseDto
    {
        public Guid JourneyId { get; set; }
        public Guid OwnerId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public decimal DistanceKm { get; set; }
        public decimal CO2SavedKg { get; set; } // Lượng CO2 ước tính
        public Guid? BatchId { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}