using Application.Common.DTOs;
using Application.Common.Features.Transactions.Queries.GetAllTransactions;
using Application.Common.Features.Transactions.Queries.GetDashboardSummary;
using Application.Common.Interfaces;
using CarbonTC.API.Common;
using Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CarbonTC.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TransactionController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ICurrentUserService _currentUser;
        private readonly IUnitOfWork _unitOfWork;

        public TransactionController(IMediator mediator, ICurrentUserService currentUser, IUnitOfWork unitOfWork)
        {
            _mediator = mediator;
            _currentUser = currentUser;
            _unitOfWork = unitOfWork;
        }

        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery]GetAllTransactionsQuery query, CancellationToken cancellationToken = default)
        {
            var transactions = await _mediator.Send(query, cancellationToken);
            return Ok(ApiResponse<object>.SuccessResponse(transactions, "Transactions retrieved successfully"));
        }

        [Authorize]
        [HttpGet("/api/listings/{listingId}/transactions")]
        public async Task<IActionResult> GetByListing(
            Guid listingId,
            [FromQuery] GetAllTransactionsQuery query,
            CancellationToken cancellationToken = default)
        {
            var listing = await _unitOfWork.Listings.GetByIdAsync(listingId, cancellationToken);
            if (listing == null)
                return NotFound(ApiResponse<object>.ErrorResponse("Listing not found"));

            GetAllTransactionsQuery modifiedQuery;

            if (listing.OwnerId == _currentUser.UserId || _currentUser.IsInRole("ADMIN"))
            {
                modifiedQuery = query with
                {
                    ListingId = listingId,
                    SellerId = null,
                    BuyerId = null
                };
            }
            else
            {
                modifiedQuery = query with
                {
                    ListingId = listingId,
                    SellerId = null,
                    BuyerId = _currentUser.UserId
                };
            }

            var transactions = await _mediator.Send(modifiedQuery, cancellationToken);
            return Ok(ApiResponse<object>.SuccessResponse(transactions,
                $"Transactions for listing {listingId} retrieved successfully"));
        }


        [Authorize]
        [HttpGet("/api/users/me/transactions")]
        public async Task<IActionResult> GetMyTransactions(
            [FromQuery] GetAllTransactionsQuery query,
            CancellationToken cancellationToken = default)
        {
            var userId = _currentUser.UserId.Value;

            var modifiedQuery = query with
            {
                BuyerId = query.BuyerId ?? userId,  
                SellerId = query.SellerId ?? userId  
            };

            var transactions = await _mediator.Send(modifiedQuery, cancellationToken);
            return Ok(ApiResponse<object>.SuccessResponse(transactions, "Your transactions retrieved successfully"));
        }

        [Authorize]
        [HttpGet("/api/users/me/transactions/purchases")]
        public async Task<IActionResult> GetMyPurchases(
            [FromQuery] GetAllTransactionsQuery query,
            CancellationToken cancellationToken = default)
        {
            var modifiedQuery = query with
            {
                BuyerId = _currentUser.UserId,
                SellerId = null  
            };

            var transactions = await _mediator.Send(modifiedQuery, cancellationToken);
            return Ok(ApiResponse<object>.SuccessResponse(transactions, "Your purchases retrieved successfully"));
        }


        [Authorize]
        [HttpGet("/api/users/me/transactions/sales")]
        public async Task<IActionResult> GetMySales(
            [FromQuery] GetAllTransactionsQuery query,
            CancellationToken cancellationToken = default)
        {
            var modifiedQuery = query with
            {
                SellerId = _currentUser.UserId,
                BuyerId = null  
            };

            var transactions = await _mediator.Send(modifiedQuery, cancellationToken);
            return Ok(ApiResponse<object>.SuccessResponse(transactions, "Your sales retrieved successfully"));
        }
    
        
        [Authorize]
        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary(CancellationToken cancellationToken = default)
        {
            var transactionSummary = await _mediator.Send(new GetDashboardSummaryQuery(), cancellationToken);
            if (transactionSummary.IsSuccess)
            {
                return Ok(ApiResponse<TransactionSummaryDto>.SuccessResponse(transactionSummary.Value));
            }
            return Unauthorized();
        }
    }
}
