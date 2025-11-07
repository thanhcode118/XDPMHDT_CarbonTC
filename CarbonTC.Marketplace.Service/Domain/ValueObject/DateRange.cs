using Domain.Exceptions;

namespace Domain.ValueObject
{
    public record DateRange
    {
        public DateTime StartDate { get; init; }
        public DateTime EndDate { get; init; }

        public DateRange(DateTime startDate, DateTime endDate)
        {
            if (endDate < startDate)
                throw new DomainException("End date must be after start date");

            StartDate = startDate;
            EndDate = endDate;
        }

        public bool Contains(DateTime date)
        {
            return date >= StartDate && date <= EndDate;
        }

        public bool Overlaps(DateRange other)
        {
            return StartDate <= other.EndDate && other.StartDate <= EndDate;
        }

        public TimeSpan Duration => EndDate - StartDate;
    }
}
