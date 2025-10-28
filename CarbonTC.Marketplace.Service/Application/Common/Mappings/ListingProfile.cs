using Application.Common.Features.Listings.DTOs;
using AutoMapper;
using Domain.Entities;

namespace Application.Common.Mappings
{
    public class ListingProfile : Profile
    {
        public ListingProfile()
        {
            CreateMap<Listing, ListingDetailDto>()
                .ForMember(dest => dest.AuctionBids, opt => opt.MapFrom(src => src.Bids))
                .ForMember(dest => dest.SuggestedPrice, opt => opt.MapFrom(src => src.PriceSuggestion != null ? 
                                                        src.PriceSuggestion.SuggestedPrice : (decimal?)null));

            CreateMap<Listing, ListingDto>().ReverseMap();
        }
    }
}
