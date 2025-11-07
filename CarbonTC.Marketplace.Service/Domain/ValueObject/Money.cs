using Domain.Exceptions;

namespace Domain.ValueObject
{
    public record Money
    {
        public decimal Amount { get; init; }
        public string Currency { get; init; }

        public Money(decimal amount, string currency = "USD")
        {
            if (amount < 0)
                throw new DomainException("Amount cannot be negative");

            if (string.IsNullOrWhiteSpace(currency))
                throw new DomainException("Currency cannot be empty");

            Amount = amount;
            Currency = currency.ToUpperInvariant();
        }

        public static Money Zero(string currency = "USD") => new(0, currency);

        public Money Add(Money other)
        {
            if (Currency != other.Currency)
                throw new DomainException("Cannot add money with different currencies");

            return new Money(Amount + other.Amount, Currency);
        }

        public Money Subtract(Money other)
        {
            if (Currency != other.Currency)
                throw new DomainException("Cannot subtract money with different currencies");

            return new Money(Amount - other.Amount, Currency);
        }

        public Money Multiply(decimal multiplier)
        {
            return new Money(Amount * multiplier, Currency);
        }

        public static bool operator >(Money left, Money right)
        {
            if (left.Currency != right.Currency)
                throw new DomainException("Cannot compare money with different currencies");

            return left.Amount > right.Amount;
        }

        public static bool operator <(Money left, Money right)
        {
            if (left.Currency != right.Currency)
                throw new DomainException("Cannot compare money with different currencies");

            return left.Amount < right.Amount;
        }
    }
}
