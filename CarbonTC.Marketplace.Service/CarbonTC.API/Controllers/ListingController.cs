using Application.Common.Features.Listings.Commands.BuyNow;
using Application.Common.Features.Listings.Commands.CreateListing;
using Application.Common.Features.Listings.Commands.DeleteListing;
using Application.Common.Features.Listings.Commands.UpdateListing;
using Application.Common.Features.Listings.DTOs;
using Application.Common.Features.Listings.Queries.GetAllListings;
using Application.Common.Features.Listings.Queries.GetByIdListing;
using CarbonTC.API.Common;
using Domain.Enum;
using MediatR;
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

        [HttpPost]
        public async Task<IActionResult> CreateListing(
        [FromBody] CreateListingCommand command,
        CancellationToken cancellationToken = default)
        {
            var result = await _mediator.Send(command, cancellationToken);

            if (result.IsSuccess)
            {
                var apiResponse = ApiResponse<Guid>.SuccessResponse(result.Value, "Listing created successfully.");

                //return CreatedAtAction(nameof(GetListingById), new { id = result.Value }, apiResponse);
                // Hoặc đơn giản hơn là trả về 200 OK nếu bạn không có endpoint GetById
                return Ok(apiResponse);
            }
            else
            {
                // Tạo response thất bại
                var errors = new List<string> { $"{result.Error.Code}: {result.Error.Message}" };
                var apiResponse = ApiResponse<Guid>.ErrorResponse("Failed to create listing.", errors);

                // Trả về 400 Bad Request với thông tin lỗi
                return BadRequest(apiResponse);
            }
        }

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

        [HttpGet("GetAll")]
        public async Task<IActionResult> GetAllListings(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] ListingStatus? status = null,
            [FromQuery] ListingType? type = null,
            [FromQuery] Guid? ownerId = null,
            [FromQuery] decimal? minPrice = null,
            [FromQuery] decimal? maxPrice = null,
            CancellationToken cancellationToken = default)
        {
            var query = new GetAllListingsQuery(pageNumber, pageSize, type, status, minPrice, maxPrice, ownerId);
            var result = await _mediator.Send(query, cancellationToken);

            return Ok(ApiResponse<object>.SuccessResponse(result, "Listings retrieved successfully."));
        }

        [HttpGet]
        public async Task<IActionResult> GetDetailById([FromQuery] Guid listingId)
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

        [HttpPut]
        public async Task<IActionResult> UpdateListing([FromBody] UpdateListingCommand command, CancellationToken cancellationToken = default)
        {
            var result = await _mediator.Send(command, cancellationToken);
            if (!result.IsSuccess)
            {
                var errors = new List<string> { $"{result.Error.Code}: {result.Error.Message}" };
                return BadRequest(ApiResponse<object>.ErrorResponse("Listing.UpdateFailed", errors));
            }
            return Ok(ApiResponse<Guid>.SuccessResponse(command.ListingId, "Listing updated successfully."));
        }

        [HttpPost("buyfixedprice")]
        [Route("{id:Guid}")]
        public async Task<IActionResult> BuyBixedPrice([FromRoute] Guid id, [FromBody] BuyNowCommand command, CancellationToken cancellationToken = default)
        {
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
    }
}
