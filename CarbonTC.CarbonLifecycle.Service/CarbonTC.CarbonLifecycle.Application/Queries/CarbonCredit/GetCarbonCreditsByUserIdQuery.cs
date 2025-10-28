using System.Collections.Generic;
using CarbonTC.CarbonLifecycle.Application.DTOs;
using MediatR;

namespace CarbonTC.CarbonLifecycle.Application.Queries.CarbonCredit
{
    public class GetCarbonCreditsByUserIdQuery : IRequest<IEnumerable<CarbonCreditDto>>
    {
        public string UserId { get; }

        public GetCarbonCreditsByUserIdQuery(string userId)
        {
            UserId = userId;
        }
    }
}