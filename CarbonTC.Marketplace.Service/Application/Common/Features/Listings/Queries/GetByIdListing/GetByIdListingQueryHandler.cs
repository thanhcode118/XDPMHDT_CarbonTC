using Application.Common.Features.Listings.DTOs;
using Application.Common.Interfaces;
using AutoMapper;
using Domain.Common.Response;
using MediatR;

namespace Application.Common.Features.Listings.Queries.GetByIdListing
{
    public class GetByIdListingQueryHandler : IRequestHandler<GetByIdListingQuery, Result<ListingDetailDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public GetByIdListingQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<Result<ListingDetailDto>> Handle(GetByIdListingQuery request, CancellationToken cancellationToken)
        {
            var listing = await _unitOfWork.Listings.GetByIdAsync(request.ListingId, cancellationToken);

            if (listing is null)
                return Result.Failure<ListingDetailDto>(new Error("Listing.NotFound", $"Listing with ID {request.ListingId} was not found."));

            var dto = _mapper.Map<ListingDetailDto>(listing);

            return Result.Success(dto);
        }
    }
}
