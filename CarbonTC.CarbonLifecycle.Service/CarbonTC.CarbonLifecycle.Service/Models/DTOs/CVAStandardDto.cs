namespace CarbonTC.CarbonLifecycle.Service.Models.DTOs
{
    // DTO hiển thị thông tin của một tiêu chuẩn CVA.
    public class CVAStandardDto
    {
        public Guid StandardId { get; set; }
        public string StandardName { get; set; }
        public string Description { get; set; }
        public decimal ConversionRate { get; set; } // Tỷ lệ quy đổi từ CO2 (kg) sang 1 tín chỉ
        public DateTime CreatedAt { get; set; }
    }
}