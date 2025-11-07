using Domain.Exceptions;

namespace Domain.ValueObject
{
    public record CreditQuantity
    {
        public decimal Value { get; init; }

        public CreditQuantity(decimal value)
        {
            if (value < 0)
                throw new DomainException("Credit quantity cannot be negative");

            Value = value;
        }

        public static CreditQuantity Zero() => new(0);

        public CreditQuantity Add(CreditQuantity other)
        {
            return new CreditQuantity(Value + other.Value);
        }

        public CreditQuantity Subtract(CreditQuantity other)
        {
            if (Value < other.Value)
                throw new DomainException("Cannot subtract more credits than available");

            return new CreditQuantity(Value - other.Value);
        }

        public bool IsSufficient(CreditQuantity required)
        {
            return Value >= required.Value;
        }

        public static bool operator >(CreditQuantity left, CreditQuantity right)
            => left.Value > right.Value;

        public static bool operator <(CreditQuantity left, CreditQuantity right)
            => left.Value < right.Value;

        public static bool operator >=(CreditQuantity left, CreditQuantity right)
            => left.Value >= right.Value;

        public static bool operator <=(CreditQuantity left, CreditQuantity right)
            => left.Value <= right.Value;
    }
}
