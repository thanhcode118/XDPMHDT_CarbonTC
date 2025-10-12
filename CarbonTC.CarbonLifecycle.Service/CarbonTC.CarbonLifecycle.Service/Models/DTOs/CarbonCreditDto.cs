namespace CarbonTC.CarbonLifecycle.Service.Models.DTOs
{
    // DTO hiển thị thông tin của một tín chỉ carbon đã được phát hành.
    public class CarbonCreditDto
    {
        public Guid CreditId { get; set; }
        public Guid OwnerId { get; set; }
        public Guid RequestId { get; set; }
        public decimal Amount { get; set; }
        public string Status { get; set; }
        public Guid IssuedByCVA { get; set; }
        public DateTime IssuedAt { get; set; }
        public string CreditSerialNumber { get; set; }
        public int Vintage { get; set; } // Năm phát hành
    }
}