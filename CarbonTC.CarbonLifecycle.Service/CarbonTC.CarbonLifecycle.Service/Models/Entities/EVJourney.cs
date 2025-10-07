using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarbonTC.CarbonLifecycle.Service.Models.Entities
{
    public class EVJourney
    {
        [Key]
        public Guid JourneyId { get; set; } // PK

        [Required]
        public Guid OwnerId { get; set; } // FK to User Service's UserId

        [Required]
        public DateTime StartTime { get; set; }

        [Required]
        public DateTime EndTime { get; set; }

        public Guid? BatchId { get; set; } // FK to JourneyBatch.BatchId
        [ForeignKey("BatchId")]
        public JourneyBatch? Batch { get; set; } // Navigation property

        public string? UploadedFilePath { get; set; } // Đường dẫn file upload (nếu giả lập)

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}