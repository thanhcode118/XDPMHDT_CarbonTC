using Domain.Entities;

namespace Domain.Specifications
{
    public static class InventorySpecifications
    {
        public static bool HasSufficientAvailable(CreditInventory inventory, decimal requiredAmount)
        {
            return inventory.AvailableAmount >= requiredAmount;
        }

        public static bool HasSufficientListed(CreditInventory inventory, decimal requiredAmount)
        {
            return inventory.ListedAmount >= requiredAmount;
        }

        public static bool HasSufficientLocked(CreditInventory inventory, decimal requiredAmount)
        {
            return inventory.LockedAmount >= requiredAmount;
        }
    }
}
