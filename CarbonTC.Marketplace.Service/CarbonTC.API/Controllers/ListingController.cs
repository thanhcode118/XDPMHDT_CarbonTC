using Application.Common.DTOs;
using Application.Common.Features.Listings.Commands.Auctions;
using Application.Common.Features.Listings.Commands.BuyNow;
using Application.Common.Features.Listings.Commands.CloseAuction;
using Application.Common.Features.Listings.Commands.CreateListing;
using Application.Common.Features.Listings.Commands.DeleteListing;
using Application.Common.Features.Listings.Commands.UpdateListing;
using Application.Common.Features.Listings.DTOs;
using Application.Common.Features.Listings.Queries.CanWithdraw;
using Application.Common.Features.Listings.Queries.GetAllListings;
using Application.Common.Features.Listings.Queries.GetByIdListing;
using Application.Common.Features.Listings.Queries.GetMyListings;
using Application.Common.Features.Listings.Queries.GetPriceSuggestion;
using CarbonTC.API.Common;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CarbonTC.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ListingController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ListingController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateListing(
        [FromBody] CreateListingCommand command,
        CancellationToken cancellationToken = default)
        {
            var result = await _mediator.Send(command, cancellationToken);

            if (result.IsSuccess)
            {
                var apiResponse = ApiResponse<Guid>.SuccessResponse(result.Value, "Listing created successfully.");

                return CreatedAtAction(nameof(GetDetailById), new { listingId = result.Value }, apiResponse);
            }
            else
            {
                var errors = new List<string> { $"{result.Error.Code}: {result.Error.Message}" };
                var apiResponse = ApiResponse<Guid>.ErrorResponse("Failed to create listing.", errors);
                return BadRequest(apiResponse);
            }
        }

        [Authorize]
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteListing(Guid id, CancellationToken cancellationToken = default)
        {
            var result = await _mediator.Send(new DeleteListingCommand(id), cancellationToken);

            if (result.IsSuccess)
            {
                var apiResponse = ApiResponse<Guid>.SuccessResponse(id, "Listing deleted successfully.");
                return Ok(apiResponse);
            }
            else
            {
                var errors = new List<string> { $"{result.Error.Code}: {result.Error.Message}" };
                var apiResponse = ApiResponse<Guid>.ErrorResponse("Failed to delete listing.", errors);
                return BadRequest(apiResponse);
            }
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetAllListings(
            [FromQuery] GetAllListingsQuery getAllListingsQuery,
            CancellationToken cancellationToken = default)
        {
            var result = await _mediator.Send(getAllListingsQuery, cancellationToken);

            return Ok(ApiResponse<object>.SuccessResponse(result, "Listings retrieved successfully."));
        }

        [Authorize]
        [HttpGet("{listingId:guid}")]
        public async Task<IActionResult> GetDetailById([FromRoute] Guid listingId)
        {
            var query = new GetByIdListingQuery(listingId);
            var result = await _mediator.Send(query);

            if (!result.IsSuccess)
            {
                var errors = new List<string> { $"{result.Error.Code}: {result.Error.Message}" };
                return NotFound(ApiResponse<object>.ErrorResponse("Listing.NotFound", errors));
            }

            return Ok(ApiResponse<ListingDetailDto>.SuccessResponse(result.Value));
        }

        [Authorize]
        [HttpPut("{id:guid}")]
        public async Task<IActionResult> UpdateListing(Guid id, [FromBody] UpdateListingRequest request, CancellationToken cancellationToken = default)
        {
            var command = new UpdateListingCommand(
                id,
                request.Type,
                request.PricePerUnit,
                request.Status,
                request.ClosedAt,
                request.MinimumBid,
                request.AuctionEndTime
            );

            var result = await _mediator.Send(command, cancellationToken);
            if (!result.IsSuccess)
            {
                var errors = new List<string> { $"{result.Error.Code}: {result.Error.Message}" };
                return BadRequest(ApiResponse<object>.ErrorResponse("Listing.UpdateFailed", errors));
            }
            return Ok(ApiResponse<Guid>.SuccessResponse(command.ListingId, "Listing updated successfully."));
        }

        [Authorize]
        [HttpPost("{id:guid}/buy")]
        public async Task<IActionResult> BuyFixedPrice([FromRoute] Guid id, [FromBody] BuyNowRequestDto requestDto, CancellationToken cancellationToken = default)
        {
            var command = new BuyNowCommand
            {
                ListingId = id,
                Amount = requestDto.Amount
            };

            var listing = await _mediator.Send(command, cancellationToken);
            if (listing.IsSuccess)
            {
                return Ok(ApiResponse<Guid>.SuccessResponse(id, "Purchase successful."));
            }
            else
            {
                var errors = new List<string> { $"{listing.Error.Code}: {listing.Error.Message}" };
                return BadRequest(ApiResponse<object>.ErrorResponse("Purchase.Failed", errors));
            }
        }

        [Authorize]
        [HttpPost("auctions/{listingId:guid}/bids")]
        public async Task<IActionResult> PlaceBid(Guid listingId, [FromBody]AuctionDto auction, CancellationToken cancellationToken = default)
        {
            try
            {
                var bidCommand = new AuctionCommand
                {
                    ListingId = listingId,
                    BidAmount = auction.BidAmount
                };

                var result = await _mediator.Send(bidCommand, cancellationToken);

                if (result.IsFailure)
                {
                    var errors = new List<string> { $"{result.Error.Code}: {result.Error.Message}" };
                    var errorResponse = ApiResponse<object>.ErrorResponse(result.Error.Message, errors);

                    return BadRequest(errorResponse);
                }
                var value = result.Value;

                return Ok(ApiResponse<object>.SuccessResponse(value, "Bid placed successfully."));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<object>.ErrorResponse(
                    "Invalid operation",
                    new List<string> { ex.Message }));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse(
                    "Unexpected error",
                    new List<string> { ex.Message }));
            }

        }

        [Authorize]
        [HttpPost("auction/{listingId:guid}/close")]
        public async Task<IActionResult> CloseAuction([FromRoute] Guid listingId, CancellationToken cancellationToken = default)
        {
            var command = new CloseAuctionCommand
            {
                ListingId = listingId
            };

            var result = await _mediator.Send(command, cancellationToken);

            if (result.IsSuccess)
            {
                var apiResponse = ApiResponse<object>.SuccessResponse(
                    data: null,
                    message: "Auction closed successfully."
                );
                return Ok(apiResponse);
            }

            var errorResponse = ApiResponse<object>.ErrorResponse(
                message: result.Error.Message, 
                errors: new List<string> { result.Error.Code } 
            );

            return BadRequest(errorResponse);
        }

        [Authorize]
        [HttpPost("suggest-price")]
        public async Task<IActionResult> SuggestPrice(
            [FromQuery] Guid creditId,
            CancellationToken cancellationToken)
        {
            var query = new GetPriceSuggestionQuery
            {
                CreditId = creditId,
            };

            var result = await _mediator.Send(query, cancellationToken);

            if (result.IsSuccess)
            {
                return Ok(ApiResponse<float>.SuccessResponse(result.Value));
            }

            return BadRequest(ApiResponse<float>.ErrorResponse(result.Error.Message));
        }

        [Authorize]
        [HttpGet("my-listing")]
        public async Task<IActionResult> GetMyListings(CancellationToken cancellationToken)
        {
            var query = await _mediator.Send(new GetMyListingsQuery(), cancellationToken);
            if (query.IsSuccess)
            {
                var apiResponse = ApiResponse<List<ListingDto>>.SuccessResponse(query.Value, "User listings retrieved successfully.");
                return Ok(apiResponse);
            }
            else
            {
                var errors = new List<string> { $"{query.Error.Code}: {query.Error.Message}" };
                var apiResponse = ApiResponse<List<ListingDto>>.ErrorResponse("Failed to retrieve user listings.", errors);
                return BadRequest(apiResponse);
            }
        }

        [HttpPost("canwithdraw")]
        public async Task<IActionResult> CanWithdraw([FromBody]CanWithdrawQuery canWithdrawQuery, CancellationToken cancellationToken)
        {
            var query = await _mediator.Send(canWithdrawQuery, cancellationToken);
            return Ok(ApiResponse<bool>.SuccessResponse(query.Value));
        }
    }
}
