using System;

namespace CarbonTC.CarbonLifecycle.Domain.Entities
{
    public class AuditReport : BaseEntity
    {
        public Guid Id { get; set; }
        public string EntityType { get; set; } // E.g., "EVJourney", "CarbonCredit"
        public Guid EntityId { get; set; }
        public string Action { get; set; } // E.g., "Created", "Updated", "Deleted"
        public string ChangedBy { get; set; } // User ID
        public DateTime ChangeDate { get; set; }
        public string OriginalValues { get; set; } // JSON representation of original values
        public string NewValues { get; set; } // JSON representation of new values
    }
}