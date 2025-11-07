using Domain.Common.Response;
using MediatR;

namespace Application.Common.Features.Listings.Commands.DeleteListing
{
    public record DeleteListingCommand(Guid ListingId) : IRequest<Result>;
}
