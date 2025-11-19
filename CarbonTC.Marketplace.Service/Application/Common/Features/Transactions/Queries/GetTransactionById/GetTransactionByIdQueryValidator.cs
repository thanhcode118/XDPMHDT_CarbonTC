using FluentValidation;

namespace Application.Common.Features.Transactions.Queries.GetTransactionById
{
    public class GetTransactionByIdQueryValidator : AbstractValidator<GetTransactionByIdQuery>
    {
        public GetTransactionByIdQueryValidator()
        {
            RuleFor(x => x.id)
                .NotEmpty().WithMessage("Id is not null");
        }
    }
}
