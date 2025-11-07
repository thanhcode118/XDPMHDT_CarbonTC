using System.Collections.Generic;

namespace Application.Common.DTOs
{
    public class ChartDataResponseDto
    {
        public List<string> Labels { get; set; } = new();

        public List<ChartDatasetDto> Datasets { get; set; } = new();
    }
}