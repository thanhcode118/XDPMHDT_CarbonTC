namespace CarbonTC.CarbonLifecycle.Service.Models.DTOs
{
    // DTO để EV Owner tạo một yêu cầu xác minh mới cho một lô hành trình.
    public class VerificationRequestCreateDto
    {
        public Guid OwnerId { get; set; }

        public Guid BatchId { get; set; }

        public Guid StandardId { get; set; } // ID của tiêu chuẩn CVA được áp dụng
    }
}