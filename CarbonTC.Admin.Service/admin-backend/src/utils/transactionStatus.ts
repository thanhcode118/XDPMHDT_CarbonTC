
export enum TransactionStatusCode {
  PENDING = 1,
  SUCCESS = 2,
  FAILED = 3,
  REFUNDED = 4,
  DISPUTED = 5
}

export const TransactionStatusLabels: Record<number, string> = {
  1: 'Pending',
  2: 'Success',
  3: 'Failed',
  4: 'Refunded',
  5: 'Disputed'
};

/**
 * Map numeric transaction status to string label
 * @param statusCode - Numeric status code from Marketplace Service
 * @returns Human-readable status label
 */
export const mapTransactionStatus = (statusCode: number): string => {
  return TransactionStatusLabels[statusCode] || 'Unknown';
};

/**
 * Get transaction status color for UI
 * @param statusCode - Numeric status code
 * @returns Color indicator
 */
export const getTransactionStatusColor = (statusCode: number): string => {
  switch (statusCode) {
    case TransactionStatusCode.PENDING:
      return 'warning';
    case TransactionStatusCode.SUCCESS:
      return 'success';
    case TransactionStatusCode.FAILED:
      return 'error';
    case TransactionStatusCode.REFUNDED:
      return 'info';
    case TransactionStatusCode.DISPUTED:
      return 'secondary';
    default:
      return 'default';
  }
};

/**
 * Check if transaction can be disputed
 * @param statusCode - Numeric status code
 * @returns true if transaction can be disputed
 */
export const canDisputeTransaction = (statusCode: number): boolean => {
  return statusCode === TransactionStatusCode.SUCCESS || 
         statusCode === TransactionStatusCode.PENDING;
};