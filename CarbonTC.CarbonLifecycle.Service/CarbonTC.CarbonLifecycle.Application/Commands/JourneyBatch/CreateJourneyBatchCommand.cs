using CarbonTC.CarbonLifecycle.Application.DTOs;
using MediatR;

namespace CarbonTC.CarbonLifecycle.Application.Commands.JourneyBatch
{
    // Command này sẽ trả về DTO của lô vừa tạo
    public class CreateJourneyBatchCommand : IRequest<JourneyBatchDto>
    {
        public JourneyBatchCreateDto BatchData { get; }

        public CreateJourneyBatchCommand(JourneyBatchCreateDto batchData)
        {
            BatchData = batchData;
        }
    }
}