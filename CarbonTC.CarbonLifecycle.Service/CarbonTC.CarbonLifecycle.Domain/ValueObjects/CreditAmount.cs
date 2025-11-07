using System;
using System.Collections.Generic;
using System.Linq;

namespace CarbonTC.CarbonLifecycle.Domain.ValueObjects
{
    public class CreditAmount : ValueObject<CreditAmount>
    {
        public int Value { get; }

        private CreditAmount(int value)
        {
            if (value < 0)
            {
                throw new ArgumentException("Credit amount cannot be negative.", nameof(value));
            }
            Value = value;
        }

        public static CreditAmount FromInt(int amount) => new CreditAmount(amount);

        public CreditAmount Add(CreditAmount other) => new CreditAmount(Value + other.Value);
        public CreditAmount Subtract(CreditAmount other)
        {
            if (Value - other.Value < 0)
            {
                throw new InvalidOperationException("Cannot subtract more credits than available.");
            }
            return new CreditAmount(Value - other.Value);
        }

        protected override IEnumerable<object> GetEqualityComponents()
        {
            yield return Value;
        }

        public override string ToString() => $"{Value} credits";
    }
}