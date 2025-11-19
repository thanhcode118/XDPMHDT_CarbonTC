using Application.Common.Features.Transactions.Commands.ExportStatement;
using Application.Common.Features.Transactions.DTOs;
using Application.Common.Interfaces;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore; 

public class ExportStatementCommandHandler : IRequestHandler<ExportStatementCommand, byte[]>
{
    private readonly IApplicationDbContext _dbContext; 
    private readonly IExcelService _excelService;
    private readonly IMapper _mapper; 

    public ExportStatementCommandHandler(
        IApplicationDbContext dbContext,
        IExcelService excelService,
        IMapper mapper)
    {
        _dbContext = dbContext;
        _excelService = excelService;
        _mapper = mapper;
    }

    public async Task<byte[]> Handle(ExportStatementCommand request, CancellationToken cancellationToken)
    {
        var transactions = await _dbContext.Transactions
            .Where(t => (t.BuyerId == request.UserId || t.SellerId == request.UserId)
                          && t.CreatedAt >= request.StartDate
                          && t.CreatedAt <= request.EndDate) 
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync(cancellationToken); 

        var dtos = _mapper.Map<List<TransactionDto>>(transactions);

        return await _excelService.ExportTransactionStatementAsync(
            dtos,
            request.UserId,
            request.StartDate,
            request.EndDate
        );
    }
}