using FluentValidation;

namespace Application.Common.Features.Listings.Queries.GetByIdListing
{
    public class GetByIdListingQueryValidator : AbstractValidator<GetByIdListingQuery>
    {
        public GetByIdListingQueryValidator()
        {
            RuleFor(x => x.ListingId)
                .NotEmpty().WithMessage("ListingId can not null");
        }
    }
}
