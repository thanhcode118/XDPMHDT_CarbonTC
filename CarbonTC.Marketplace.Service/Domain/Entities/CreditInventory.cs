using Domain.Common;
using Domain.Events.Inventory;
using Domain.Exceptions;

namespace Domain.Entities
{
    public class CreditInventory: BaseEntity, AggregateRoot
    {
        public Guid CreditId { get; private set; }
        public decimal TotalAmount { get; private set; }
        public decimal AvailableAmount { get; private set; }
        public decimal ListedAmount { get; private set; }
        public decimal LockedAmount { get; private set; }

        private CreditInventory() {}

        private CreditInventory(Guid creditId, decimal totalAmount)
        {
            Id = Guid.NewGuid();
            CreditId = creditId;
            TotalAmount = totalAmount;
            AvailableAmount = totalAmount;
            ListedAmount = 0;
            LockedAmount = 0;
            UpdatedAt = DateTime.UtcNow;
        }

        public static CreditInventory Create(Guid creditId, decimal totalAmount)
        {
            if (totalAmount <= 0)
                throw new DomainException("Total amount must be greater than zero");

            return new CreditInventory(creditId, totalAmount);
        }

        public void ReserveForListing(decimal amount)
        {
            if (amount <= 0)
                throw new DomainException("Amount must be greater than zero");

            if (AvailableAmount < amount)
                throw new DomainException($"Insufficient available credits. Available: {AvailableAmount}, Requested: {amount}");

            AvailableAmount -= amount;
            ListedAmount += amount;
            UpdatedAt = DateTime.UtcNow;

            AddDomainEvent(new InventoryReservedDomainEvent(CreditId, amount));
        }


        public void ReleaseFromListing(decimal amount)
        {
            if (amount <= 0)
                throw new DomainException("Amount must be greater than zero");

            if (ListedAmount < amount)
                throw new DomainException("Cannot release more than listed amount");

            ListedAmount -= amount;
            AvailableAmount += amount;
            UpdatedAt = DateTime.UtcNow;

            AddDomainEvent(new InventoryReleasedDomainEvent(CreditId, amount));
        }

        public void LockForTransaction(decimal amount)
        {
            if (amount <= 0)
                throw new DomainException("Amount must be greater than zero");

            if (ListedAmount < amount)
                throw new DomainException($"Insufficient listed credits. Listed: {ListedAmount}, Requested: {amount}");

            ListedAmount -= amount;
            LockedAmount += amount;
            UpdatedAt = DateTime.UtcNow;

            AddDomainEvent(new InventoryLockedDomainEvent(CreditId, amount));
        }

        public void CompleteTransaction(decimal amount)
        {
            if (amount <= 0)
                throw new DomainException("Amount must be greater than zero");

            if (LockedAmount < amount)
                throw new DomainException("Cannot complete more than locked amount");

            LockedAmount -= amount;
            TotalAmount -= amount;
            UpdatedAt = DateTime.UtcNow;

            AddDomainEvent(new InventoryTransactionCompletedDomainEvent(CreditId, amount));
        }

        public void RollbackTransaction(decimal amount)
        {
            if (amount <= 0)
                throw new DomainException("Amount must be greater than zero");

            if (LockedAmount < amount)
                throw new DomainException("Cannot rollback more than locked amount");

            LockedAmount -= amount;
            AvailableAmount += amount;
            UpdatedAt = DateTime.UtcNow;

            AddDomainEvent(new InventoryTransactionRolledBackDomainEvent(CreditId, amount));
        }

        public void AddCredits(decimal amount)
        {
            if (amount <= 0)
                throw new DomainException("Amount must be greater than zero");

            TotalAmount += amount;
            AvailableAmount += amount;
            UpdatedAt = DateTime.UtcNow;

            AddDomainEvent(new InventoryIncreasedDomainEvent(CreditId, amount));
        }

        public void CommitDirectSale(decimal amount)
        {
            TotalAmount -= amount;
            AvailableAmount -= amount;
        }

        public bool HasSufficientAvailable(decimal amount)
        {
            return AvailableAmount >= amount;
        }

    }
}
