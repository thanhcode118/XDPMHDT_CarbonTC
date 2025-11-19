using Application.Common.DTOs;
using Application.Common.Features.Transactions.Commands.ExportStatement;
using Application.Common.Features.Transactions.DTOs;
using Application.Common.Features.Transactions.Queries.GetAllTransactions;
using Application.Common.Features.Transactions.Queries.GetDashboardSummary;
using Application.Common.Features.Transactions.Queries.GetDashboardWalletSummary;
using Application.Common.Features.Transactions.Queries.GetTransactionById;
using Application.Common.Features.Transactions.Queries.GetWalletChartData;
using Application.Common.Interfaces;
using CarbonTC.API.Common;
using Domain.Enum;
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
                InvolvedUserId = userId
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

        [Authorize]
        [HttpGet("wallet-summary")]
        public async Task<IActionResult> GetWalletSummary(CancellationToken cancellationToken = default)
        {
            var transactionSummary = await _mediator.Send(new GetDashboardWalletSummaryQuery(), cancellationToken);
            if (transactionSummary.IsSuccess)
            {
                return Ok(ApiResponse<DashboardWalletSummaryDto>.SuccessResponse(transactionSummary.Value));
            }
            return Unauthorized();
        }

        [Authorize]
        [HttpGet("summary/chart")]
        public async Task<IActionResult> GetWalletSummary([FromQuery]ChartPeriod period, CancellationToken cancellationToken = default)
        {
            var transactionSummary = await _mediator.Send(new GetWalletChartDataQuery(period), cancellationToken);
            if (transactionSummary.IsSuccess)
            {
                return Ok(ApiResponse<ChartDataResponseDto>.SuccessResponse(transactionSummary.Value));
            }
            return Unauthorized();
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(
            [FromRoute] Guid id,
            CancellationToken cancellationToken = default)
        {
            var query = new GetTransactionByIdQuery(id);
            var transaction = await _mediator.Send(query, cancellationToken);
            if (transaction.IsSuccess)
            {
                return Ok(ApiResponse<TransactionDto>.SuccessResponse(transaction.Value));
            }
            return NotFound(ApiResponse<TransactionDto>.ErrorResponse(transaction.Error.Code, new List<string> { transaction.Error.Message }));
        }

        [Authorize]
        [HttpGet("export-statement")]
        public async Task<IActionResult> ExportStatement([FromQuery] string rangeType)
        {
            if (_currentUser.UserId == null)
            {
                return Unauthorized();
            }

            DateTime startDate = DateTime.UtcNow;
            DateTime endDate = DateTime.UtcNow;

            switch (rangeType?.ToLower())
            {
                case "week":
                    startDate = DateTime.UtcNow.AddDays(-7);
                    break;
                case "month":
                    startDate = DateTime.UtcNow.AddMonths(-1);
                    break;
                case "year":
                    startDate = DateTime.UtcNow.AddYears(-1);
                    break;
                default:
                    return BadRequest("Khoảng thời gian không hợp lệ (chọn: week, month, hoặc year).");
            }

            var command = new ExportStatementCommand(
                _currentUser.UserId.Value,
                startDate,
                endDate
            );


            byte[] fileContent = await _mediator.Send(command);

            string fileName = $"SaoKe_{command.UserId}_{DateTime.Now:yyyyMMddHHmm}.xlsx";

            return File(
                fileContent,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                fileName
            );
        }
    }
}
