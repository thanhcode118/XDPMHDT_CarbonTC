using Application.Common.Features.CreditInventories.Queries.GetCreditInventoryByCreditId;
using CarbonTC.API.Common;
using Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CarbonTC.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CreditInventoryController : ControllerBase
    {
        private readonly IMediator _mediator;

        public CreditInventoryController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetByCreditId([FromQuery] Guid creditId)
        {
            var creditInventory = await _mediator.Send(new GetCreditInventoryByCreditIdQuery(creditId));

            if (creditInventory.IsSuccess)
            {
                var apiResponse = ApiResponse<CreditInventory>.SuccessResponse(creditInventory.Value, "Credit inventory retrieved successfully.");
                return Ok(apiResponse);
            }
            else
            {
                var errors = new List<string> { $"{creditInventory.Error.Code}: {creditInventory.Error.Message}" };
                var apiResponse = ApiResponse<CreditInventory>.ErrorResponse("Failed to retrieve credit inventory.", errors);
                return BadRequest(apiResponse);

            }
        }
    }
}

