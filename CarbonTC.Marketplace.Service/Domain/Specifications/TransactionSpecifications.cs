using Domain.Entities;
using Domain.Enum;

namespace Domain.Specifications
{
    public static class TransactionSpecifications
    {
        public static bool IsPending(Transactions transaction)
        {
            return transaction.Status == TransactionStatus.Pending;
        }

        public static bool IsCompleted(Transactions transaction)
        {
            return transaction.Status == TransactionStatus.Success;
        }

        public static bool CanBeRefunded(Transactions transaction)
        {
            return transaction.Status == TransactionStatus.Success;
        }

        public static bool CanBeDisputed(Transactions transaction)
        {
            return transaction.Status is TransactionStatus.Success or TransactionStatus.Pending;
        }
    }
}
