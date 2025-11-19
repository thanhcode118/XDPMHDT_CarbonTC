using Application.Common.Features.Transactions.DTOs;
using Domain.Common.Response;
using MediatR;

namespace Application.Common.Features.Transactions.Queries.GetTransactionById
{
    public record GetTransactionByIdQuery(Guid id): IRequest<Result<TransactionDto>>;
}
