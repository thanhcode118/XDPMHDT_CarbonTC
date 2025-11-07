namespace Application.Common.DTOs
{
    public class ChartDatasetDto
    {
        public string Label { get; set; } = string.Empty;
        public List<decimal> Data { get; set; } = new();
    }
}