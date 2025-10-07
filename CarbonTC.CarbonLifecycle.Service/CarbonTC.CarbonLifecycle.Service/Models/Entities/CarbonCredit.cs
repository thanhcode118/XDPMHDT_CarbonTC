using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using CarbonTC.CarbonLifecycle.Service.Models.Enums; // Sẽ tạo sau

namespace CarbonTC.CarbonLifecycle.Service.Models.Entities
{
    public class CarbonCredit
    {
        [Key]
        public Guid CreditId { get; set; } // PK

        [Required]
        public Guid OwnerId { get; set; } // FK to User Service's UserId

        [Required]
        public Guid RequestId { get; set; } // FK to VerificationRequests.RequestId
        [ForeignKey("RequestId")]
        public VerificationRequest? VerificationRequest { get; set; } // Navigation property

        public Guid? IssuedByCVA { get; set; } // FK to User Service's UserId (CVA role)

        [Required]
        public int Amount { get; set; } // Số lượng tín chỉ

        [Required]
        public CarbonCreditStatus Status { get; set; } // Pending, Approved, Rejected, Listed, Sold

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        public string CreditType { get; set; } = "Voluntary"; // Voluntary, Compliance

        public int Vintage { get; set; } // Năm phát hành

        [Required]
        [StringLength(50)]
        public string CreditSerialNumber { get; set; } = Guid.NewGuid().ToString(); // Số seri duy nhất

        public DateTime? ExpiryDate { get; set; }
        public DateTime? IssuedAt { get; set; } // Ngày tín chỉ chính thức được phát hành

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}