/**
 * Microservices HTTP Clients
 * 
 * Centralized HTTP clients for communicating with other microservices
 * in the Carbon Credit Marketplace platform.
 * 
 * Usage:
 * ```typescript
 * import { marketplaceClient, authClient, paymentClient } from '@/utils/clients';
 * 
 * // Check transaction exists
 * const exists = await marketplaceClient.checkTransactionExists(txnId, token);
 * 
 * // Get user details
 * const user = await authClient.getUserDetails(userId, token);
 * 
 * // Get withdrawal details
 * const withdrawal = await paymentClient.getWithdrawalDetails(requestId, token);
 * ```
 */

export { BaseServiceClient } from './baseClient';
export { default as marketplaceClient } from './marketplaceClient';
export { default as authClient } from './authClient';
export { default as paymentClient } from './paymentClient';

// Re-export for convenience
import marketplaceClient from './marketplaceClient';
import authClient from './authClient';
import paymentClient from './paymentClient';

export const clients = {
  marketplace: marketplaceClient,
  auth: authClient,
  payment: paymentClient
};

export default clients;