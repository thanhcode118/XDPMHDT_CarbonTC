using System;

namespace CarbonTC.CarbonLifecycle.Domain.Entities
{
    public class CVAStandard : BaseEntity
    {
        public Guid Id { get; set; }
        public string StandardName { get; set; } // E.g., "EU Standard 2023", "US EPA Standard"
        public string VehicleType { get; set; } // E.g., "EV", "ICE"
        public decimal ConversionRate { get; set; } // Thay đổi từ double sang decimal (e.g., kg CO2e per kWh or per Km for ICE)
        public decimal MinDistanceRequirement { get; set; } // Thay đổi từ double sang decimal (Minimum distance for a journey to be eligible)
        public DateTime EffectiveDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool IsActive { get; set; }
    }
}