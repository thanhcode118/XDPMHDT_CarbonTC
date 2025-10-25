namespace Application.Common.DTOs
{
    public class FXInfoDto
    {
        public decimal Rate { get; set; }
    }

    public class FXQueryDto
    {
        public string From { get; set; }
        public string To { get; set; }
        public decimal Amount { get; set; }
    }
    
    public class FXRateResponseDto
    {
        public bool Success { get; set; }
        public FXQueryDto Query { get; set; }
        public FXInfoDto Info { get; set; }
        public bool Historical { get; set; }
        public DateTime Date { get; set; }
        public long Timestamp { get; set; }
        public decimal Result { get; set; }
    }
}