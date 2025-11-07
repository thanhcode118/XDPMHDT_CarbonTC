using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace CarbonTC.CarbonLifecycle.Application.DTOs
{
    // DTO để tạo một lô (batch) hành trình
    public class JourneyBatchCreateDto
    {
        public string Name { get; set; }
        public List<Guid> JourneyIds { get; set; } = new List<Guid>();
    }
}