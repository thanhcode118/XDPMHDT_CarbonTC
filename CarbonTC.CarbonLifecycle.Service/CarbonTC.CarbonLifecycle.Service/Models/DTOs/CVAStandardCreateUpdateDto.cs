namespace CarbonTC.CarbonLifecycle.Service.Models.DTOs
{
    // DTO dùng để tạo mới hoặc cập nhật một tiêu chuẩn CVA.
    public class CVAStandardCreateUpdateDto
    {
        public string StandardName { get; set; }

        public string Description { get; set; }

        public decimal ConversionRate { get; set; }
    }
}