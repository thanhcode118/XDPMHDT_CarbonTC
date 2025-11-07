using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CarbonTC.CarbonLifecycle.Application.DTOs;
using MediatR;

namespace CarbonTC.CarbonLifecycle.Application.Commands.EVJourney
{
    // Command này sẽ trả về DTO của hành trình vừa tạo
    public class UploadEVJourneyCommand : IRequest<EvJourneyResponseDto>
    {
        public EvJourneyUploadDto JourneyData { get; }

        public UploadEVJourneyCommand(EvJourneyUploadDto journeyData)
        {
            JourneyData = journeyData;
        }
    }
}
