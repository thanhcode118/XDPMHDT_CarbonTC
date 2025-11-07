using Domain.Entities;
using MediatR;

namespace Application.Common.Features.Listings.Queries.GetExpiredAuctions
{
    public class GetExpiredAuctionsQuery: IRequest<List<Listing>>
    {
    }
}
