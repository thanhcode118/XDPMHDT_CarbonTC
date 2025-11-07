using Application.Common.Features.Listings.DTOs;
using Domain.Common.Models;
using Domain.Enum;
using MediatR;

namespace Application.Common.Features.Listings.Queries.GetAllListings
{
    public record GetAllListingsQuery(
        int PageNumber = 1,
        int PageSize = 20,
        ListingType? Type = null,
        ListingStatus? Status = ListingStatus.Open,
        decimal? MinPrice = null,
        decimal? MaxPrice = null,
        Guid? OwnerId = null
    ) : IRequest<PagedResult<ListingDto>>;
}
