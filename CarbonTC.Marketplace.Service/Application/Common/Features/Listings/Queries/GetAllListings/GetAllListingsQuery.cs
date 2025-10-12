using Application.Common.Features.Listings.DTOs;
using Domain.Common.Models;
using Domain.Enum;
using MediatR;

namespace Application.Common.Features.Listings.Queries.GetAllListings
{
    public record GetAllListingsQuery(
        int PageNumber = 1,
        int PageSize = 20,
        ListingType? Type = ListingType.FixedPrice,
        ListingStatus? Status = null,
        decimal? MinPrice = null,
        decimal? MaxPrice = null,
        Guid? OwnerId = null
    ) : IRequest<PagedResult<ListingDto>>;
}
