using System;
using System.Collections.Generic;
using System.Linq;

namespace CarbonTC.CarbonLifecycle.Domain.ValueObjects
{
    public class CO2Amount : ValueObject<CO2Amount>
    {
        public double Value { get; }
        public string Unit { get; }

        private CO2Amount(double value, string unit)
        {
            if (value < 0)
            {
                throw new ArgumentException("CO2 amount cannot be negative.", nameof(value));
            }
            if (string.IsNullOrWhiteSpace(unit))
            {
                throw new ArgumentException("Unit cannot be null or empty.", nameof(unit));
            }

            Value = value;
            Unit = unit;
        }

        public static CO2Amount FromKg(double kgCO2e) => new CO2Amount(kgCO2e, "kg CO2e");
        public static CO2Amount FromTons(double tonsCO2e) => new CO2Amount(tonsCO2e, "ton CO2e");

        public CO2Amount Add(CO2Amount other)
        {
            if (other.Unit != Unit)
            {
                // Có thể cần logic chuyển đổi đơn vị phức tạp hơn ở đây
                // Hoặc yêu cầu các bên gọi phương thức này phải đảm bảo cùng đơn vị
                throw new InvalidOperationException("Cannot add CO2 amounts with different units without explicit conversion.");
            }
            return new CO2Amount(Value + other.Value, Unit);
        }

        public CO2Amount Multiply(double factor)
        {
            if (factor < 0)
            {
                throw new ArgumentException("Factor cannot be negative.", nameof(factor));
            }
            return new CO2Amount(Value * factor, Unit);
        }

        // Phương thức để chuyển đổi về kg CO2e
        public CO2Amount ToKg()
        {
            if (Unit == "kg CO2e") return this;
            if (Unit == "ton CO2e") return FromKg(Value * 1000);
            throw new InvalidOperationException($"Conversion from {Unit} to kg CO2e is not supported.");
        }

        protected override IEnumerable<object> GetEqualityComponents()
        {
            yield return Value;
            yield return Unit;
        }

        public override string ToString() => $"{Value} {Unit}";
    }
}