using Application.Common.Features.Listings.DTOs;
using Domain.Common.Response;
using MediatR;

namespace Application.Common.Features.Listings.Queries.GetMyListings
{
    public record GetMyListingsQuery: IRequest<Result<List<ListingDto>>>;
}
