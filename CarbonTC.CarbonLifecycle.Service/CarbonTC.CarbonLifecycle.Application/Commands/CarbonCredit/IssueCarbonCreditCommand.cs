using CarbonTC.CarbonLifecycle.Application.DTOs;
using MediatR;

namespace CarbonTC.CarbonLifecycle.Application.Commands.CarbonCredit
{
    /// <summary>
    /// Command để phát hành tín chỉ carbon
    /// </summary>
    public class IssueCarbonCreditCommand : IRequest<CarbonCreditDto>
    {
        public IssueCarbonCreditDto IssueData { get; }

        public IssueCarbonCreditCommand(IssueCarbonCreditDto issueData)
        {
            IssueData = issueData;
        }
    }
}

