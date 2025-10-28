using Application.Common.Features.Listings.DTOs;
using Application.Common.Interfaces;
using Domain.Common.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Common.Features.Listings.Queries.GetAllListings
{
    public class GetAllListingsQueryHandler : IRequestHandler<GetAllListingsQuery, PagedResult<ListingDto>>
    {
        private readonly IApplicationDbContext _dbContext;

        public GetAllListingsQueryHandler(IApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }
        public async Task<PagedResult<ListingDto>> Handle(GetAllListingsQuery request, CancellationToken cancellationToken)
        {
            var query = _dbContext.Listings.AsNoTracking();


            if (request.Status.HasValue)
                query = query.Where(x => x.Status == request.Status.Value);

            if (request.Type.HasValue)
                query = query.Where(x => x.Type == request.Type.Value);

            if (request.OwnerId.HasValue)
                query = query.Where(x => x.OwnerId == request.OwnerId.Value);

            if (request.MinPrice.HasValue)
            {
                query = query.Where(x => x.PricePerUnit >= request.MinPrice.Value);
            }
            if (request.MaxPrice.HasValue)
            {
                query = query.Where(x => x.PricePerUnit <= request.MaxPrice.Value);
            }

            var totalCount = await query.CountAsync(cancellationToken);

            var listings = await query
                .OrderByDescending(x => x.CreatedAt)
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .Select(x => new ListingDto
                {
                    Id = x.Id,
                    CreditId = x.CreditId,
                    OwnerId = x.OwnerId,
                    Type = x.Type,
                    PricePerUnit = x.PricePerUnit,
                    Quantity = x.Quantity,
                    Status = x.Status,
                    CreatedAt = x.CreatedAt,
                    ClosedAt = x.ClosedAt,
                    MinimumBid = x.MinimumBid,
                    AuctionEndTime = x.AuctionEndTime
                })
                .ToListAsync(cancellationToken);

            return PagedResult<ListingDto>.Create(listings, totalCount, request.PageNumber, request.PageSize);
        }
    }
}
