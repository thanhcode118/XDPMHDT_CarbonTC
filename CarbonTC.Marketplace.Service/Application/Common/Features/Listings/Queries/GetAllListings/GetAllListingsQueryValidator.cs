using FluentValidation;

namespace Application.Common.Features.Listings.Queries.GetAllListings
{
    public class GetAllListingsQueryValidator : AbstractValidator<GetAllListingsQuery>
    {
        public GetAllListingsQueryValidator()
        {
            RuleFor(x => x.PageNumber)
                .GreaterThan(0).WithMessage("Page number must be greater than 0.");
            RuleFor(x => x.PageSize)
                .GreaterThan(0).WithMessage("Page size must be greater than 0.")
                .LessThanOrEqualTo(100).WithMessage("Page size must be less than or equal to 100.");
        }
    }
}
