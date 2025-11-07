namespace Domain.Exceptions
{
    public class InsufficientInventoryException : DomainException
    {
        public Guid CreditId { get; }
        public decimal RequestedAmount { get; }
        public decimal AvailableAmount { get; }

        public InsufficientInventoryException(
            Guid creditId,
            decimal requestedAmount,
            decimal availableAmount)
            : base($"Insufficient inventory for credit {creditId}. Requested: {requestedAmount}, Available: {availableAmount}")
        {
            CreditId = creditId;
            RequestedAmount = requestedAmount;
            AvailableAmount = availableAmount;
        }
    }
}
