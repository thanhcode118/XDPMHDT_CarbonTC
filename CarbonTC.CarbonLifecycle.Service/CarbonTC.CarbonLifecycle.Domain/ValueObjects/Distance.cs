using System;
using System.Collections.Generic;
using System.Linq;

namespace CarbonTC.CarbonLifecycle.Domain.ValueObjects
{
    public class Distance : ValueObject<Distance>
    {
        public double Value { get; }
        public string Unit { get; }

        private Distance(double value, string unit)
        {
            if (value < 0)
            {
                throw new ArgumentException("Distance cannot be negative.", nameof(value));
            }
            if (string.IsNullOrWhiteSpace(unit))
            {
                throw new ArgumentException("Unit cannot be null or empty.", nameof(unit));
            }

            Value = value;
            Unit = unit;
        }

        public static Distance FromKilometers(double kilometers) => new Distance(kilometers, "km");
        public static Distance FromMiles(double miles) => new Distance(miles, "miles");

        public Distance ToKilometers()
        {
            if (Unit == "km") return this;
            if (Unit == "miles") return FromKilometers(Value * 1.60934);
            throw new InvalidOperationException($"Conversion from {Unit} to km is not supported.");
        }

        public Distance ToMiles()
        {
            if (Unit == "miles") return this;
            if (Unit == "km") return FromMiles(Value / 1.60934);
            throw new InvalidOperationException($"Conversion from {Unit} to miles is not supported.");
        }

        protected override IEnumerable<object> GetEqualityComponents()
        {
            yield return Value;
            yield return Unit;
        }

        public override string ToString() => $"{Value} {Unit}";
    }

    // Base class cho Value Objects
    public abstract class ValueObject<T> where T : ValueObject<T>
    {
        protected abstract IEnumerable<object> GetEqualityComponents();

        public override bool Equals(object obj)
        {
            if (obj == null || obj.GetType() != GetType())
            {
                return false;
            }

            var other = (ValueObject<T>)obj;
            return GetEqualityComponents().SequenceEqual(other.GetEqualityComponents());
        }

        public override int GetHashCode()
        {
            return GetEqualityComponents()
                .Select(x => x != null ? x.GetHashCode() : 0)
                .Aggregate((x, y) => x ^ y);
        }

        public static bool operator ==(ValueObject<T> a, ValueObject<T> b)
        {
            if (ReferenceEquals(a, null) && ReferenceEquals(b, null)) return true;
            if (ReferenceEquals(a, null) || ReferenceEquals(b, null)) return false;
            return a.Equals(b);
        }

        public static bool operator !=(ValueObject<T> a, ValueObject<T> b)
        {
            return !(a == b);
        }
    }
}