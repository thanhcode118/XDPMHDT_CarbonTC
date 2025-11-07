namespace Application.Common.DTOs
{
    public class CVAStandardDto
    {
        public Guid Id { get; set; }
        public string StandardName { get; set; } 
        public string VehicleType { get; set; } 
        public decimal ConversionRate { get; set; } 
        public decimal MinDistanceRequirement { get; set; } 
        public DateTime EffectiveDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool IsActive { get; set; }
    }
}
