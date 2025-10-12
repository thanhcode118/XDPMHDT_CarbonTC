using FluentValidation;

namespace Application.Common.Features.Listings.Commands.DeleteListing
{
    public class DeleteListingCommandValidator : AbstractValidator<DeleteListingCommand>
    {
        public DeleteListingCommandValidator()
        {
            RuleFor(x => x.ListingId)
                .NotEmpty().WithMessage("ListingId is required.")
                .NotEqual(Guid.Empty).WithMessage("ListingId cannot be an empty GUID.");
        }
    }
}
