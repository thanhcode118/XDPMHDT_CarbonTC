namespace Domain.Exceptions
{
    public class InvalidBidException : DomainException
    {
        public InvalidBidException(string message) : base(message)
        {
        }
    }
}
