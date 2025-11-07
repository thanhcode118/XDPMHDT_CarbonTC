using FluentValidation;

namespace Application.Common.Features.Transactions.Queries.GetAllTransactions
{
    public class GetAllTransactionsQueryValidator : AbstractValidator<GetAllTransactionsQuery>
    {
        public GetAllTransactionsQueryValidator()
        {
            RuleFor(x => x.PageNumber)
                .GreaterThan(0).WithMessage("Page number must be greater than 0.");

            RuleFor(x => x.PageSize)
                .GreaterThan(0).WithMessage("Page size must be greater than 0.")
                .LessThanOrEqualTo(100).WithMessage("Page size cannot exceed 100.");

            RuleFor(x => x.EndDate)
                .GreaterThanOrEqualTo(x => x.StartDate)
                .When(x => x.StartDate.HasValue && x.EndDate.HasValue)
                .WithMessage("The end date must be greater than or equal to the start date.");

            RuleFor(x => x.MaxAmount)
                .GreaterThanOrEqualTo(x => x.MinAmount)
                .When(x => x.MinAmount.HasValue && x.MaxAmount.HasValue)
                .WithMessage("The maximum amount must be greater than or equal to the minimum amount.");

            RuleFor(x => x.SortBy)
                .IsInEnum()
                .When(x => x.SortBy.HasValue)
                .WithMessage("The specified SortBy value is not valid.");
        }
    }
}