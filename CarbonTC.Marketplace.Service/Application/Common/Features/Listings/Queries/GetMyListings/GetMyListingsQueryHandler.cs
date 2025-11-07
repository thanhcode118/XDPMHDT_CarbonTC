using Application.Common.Features.Listings.DTOs;
using Application.Common.Interfaces;
using AutoMapper;
using Domain.Common.Response;
using MediatR;

namespace Application.Common.Features.Listings.Queries.GetMyListings
{
    public class GetMyListingsQueryHandler : IRequestHandler<GetMyListingsQuery, Result<List<ListingDto>>>
    {
        private readonly ICurrentUserService _currentUser;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public GetMyListingsQueryHandler(ICurrentUserService currentUser, IUnitOfWork unitOfWork, IMapper mapper)
        {
            _currentUser = currentUser;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<Result<List<ListingDto>>> Handle(GetMyListingsQuery request, CancellationToken cancellationToken)
        {
            var listings = await _unitOfWork.Listings.GetUserListingsAsync(_currentUser.UserId!.Value, cancellationToken);
            var sortedListings = listings.OrderByDescending(l => l.CreatedAt).ToList();
            var listingDtos = _mapper.Map<List<ListingDto>>(sortedListings);
            return Result.Success(listingDtos);
        }
    }
}
