namespace CarbonTC.CarbonLifecycle.Service.Models.DTOs
{
    // DTO đại diện cho một lô hành trình đã được gộp.
    public class JourneyBatchDto
    {
        public Guid BatchId { get; set; }
        public Guid OwnerId { get; set; }
        public decimal TotalDistanceKm { get; set; }
        public decimal TotalCO2SavedKg { get; set; }
        public decimal CalculatedCredits { get; set; } // Số tín chỉ ước tính
        public string Status { get; set; } // Sử dụng string để dễ dàng hiển thị trên UI
        public DateTime CreatedAt { get; set; }
        public List<EvJourneyResponseDto> Journeys { get; set; }
    }
}