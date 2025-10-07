using Domain.Common;

namespace Domain.Entities
{
    public class CreditInventory: BaseEntity, AggregateRoot
    {
        public Guid CreditId { get; private set; }
        public decimal TotalAmount { get; private set; }
        public decimal AvailableAmount { get; private set; }
        public decimal ListedAmount { get; private set; }
        public decimal LockedAmount { get; private set; }
    }
}
