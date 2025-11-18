using Application.Common.Features.Transactions.DTOs;
using Application.Common.Interfaces;
using AutoMapper;
using Domain.Common.Response;
using MediatR;

namespace Application.Common.Features.Transactions.Queries.GetTransactionById
{
    public class GetTransactionByIdQueryHandler : IRequestHandler<GetTransactionByIdQuery, Result<TransactionDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public GetTransactionByIdQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<Result<TransactionDto>> Handle(GetTransactionByIdQuery request, CancellationToken cancellationToken)
        {
            var transaction = await _unitOfWork.Transactions.GetByIdAsync(request.id, cancellationToken);
            if (transaction == null)
            {
                return Result<TransactionDto>.Failure<TransactionDto>(Error.NullValue);
            }

            var result = _mapper.Map<TransactionDto>(transaction);
            return Result<TransactionDto>.Success(result);
        }
    }
}
