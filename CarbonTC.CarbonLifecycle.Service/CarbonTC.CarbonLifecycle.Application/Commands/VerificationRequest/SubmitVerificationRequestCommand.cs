using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;

namespace CarbonTC.CarbonLifecycle.Application.Commands.VerificationRequest
{
    // Command này trả về boolean (true nếu submit thành công)
    public class SubmitVerificationRequestCommand : IRequest<bool>
    {
        public Guid JourneyBatchId { get; }

        public SubmitVerificationRequestCommand(Guid journeyBatchId)
        {
            JourneyBatchId = journeyBatchId;
        }
    }
}
