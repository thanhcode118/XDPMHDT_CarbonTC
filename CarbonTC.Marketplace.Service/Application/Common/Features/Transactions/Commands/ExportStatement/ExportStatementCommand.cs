using MediatR;

namespace Application.Common.Features.Transactions.Commands.ExportStatement
{
    public record ExportStatementCommand(
        Guid UserId, 
        DateTime StartDate,
        DateTime EndDate
    ) : IRequest<byte[]>;
}
