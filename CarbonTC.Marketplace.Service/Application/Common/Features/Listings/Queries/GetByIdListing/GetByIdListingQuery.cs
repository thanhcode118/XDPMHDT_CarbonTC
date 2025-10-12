using Application.Common.Features.Listings.DTOs;
using Domain.Common.Response;
using MediatR;

namespace Application.Common.Features.Listings.Queries.GetByIdListing
{
    public record GetByIdListingQuery(Guid ListingId):  IRequest<Result<ListingDetailDto>>;
}
