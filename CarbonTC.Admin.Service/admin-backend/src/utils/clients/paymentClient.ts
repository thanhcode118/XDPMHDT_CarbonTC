import axios from 'axios';
import { BaseServiceClient } from './baseClient';
import logger from '../logger';

class PaymentClient extends BaseServiceClient {
  constructor() {
    super({
      baseURL: process.env.PAYMENT_SERVICE_URL || 'http://localhost:5004',
      serviceName: 'Payment Service'
    });
  }

  /**
   * Check if withdrawal request exists
   */
  async checkWithdrawalExists(
    requestId: string,
    authToken?: string
  ): Promise<boolean> {
    try {
      const config = this.buildAuthConfig(authToken);
      await this.client.get(`/api/withdrawals/${requestId}`, config);
      return true;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return false;
      }
      logger.warn(
        `[Payment] Failed to check withdrawal ${requestId}:`,
        error
      );
      return false;
    }
  }

  /**
   * Get withdrawal request details
   */
  async getWithdrawalDetails(
    requestId: string,
    authToken?: string
  ): Promise<any> {
    try {
      const config = this.buildAuthConfig(authToken);
      return await this.get(`/api/withdrawals/${requestId}`, config);
    } catch (error) {
      logger.error(
        `[Payment] Failed to get withdrawal ${requestId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get all withdrawal requests
   */
  async getWithdrawals(
    filters?: {
      page?: number;
      limit?: number;
      status?: string;
      userId?: string;
    },
    authToken?: string
  ): Promise<any> {
    const config = this.buildAuthConfig(authToken);
    config.params = filters;
    return await this.get('/api/withdrawals', config);
  }

  /**
   * Approve withdrawal request
   */
  async approveWithdrawal(
    requestId: string,
    notes?: string,
    authToken?: string
  ): Promise<any> {
    const config = this.buildAuthConfig(authToken);
    return await this.post(
      `/api/withdrawals/${requestId}/approve`,
      { notes },
      config
    );
  }

  /**
   * Reject withdrawal request
   */
  async rejectWithdrawal(
    requestId: string,
    reason: string,
    authToken?: string
  ): Promise<any> {
    const config = this.buildAuthConfig(authToken);
    return await this.post(
      `/api/withdrawals/${requestId}/reject`,
      { reason },
      config
    );
  }

  /**
   * Get wallet balance
   */
  async getWalletBalance(
    userId: string,
    authToken?: string
  ): Promise<any> {
    const config = this.buildAuthConfig(authToken);
    return await this.get(`/api/wallets/${userId}/balance`, config);
  }

  /**
   * Get carbon wallet details
   */
  async getCarbonWallet(
    userId: string,
    authToken?: string
  ): Promise<any> {
    const config = this.buildAuthConfig(authToken);
    return await this.get(`/api/carbon-wallets/${userId}`, config);
  }

  /**
   * Get e-wallet details
   */
  async getEWallet(userId: string, authToken?: string): Promise<any> {
    const config = this.buildAuthConfig(authToken);
    return await this.get(`/api/e-wallets/${userId}`, config);
  }

  /**
   * Get payment details
   */
  async getPaymentDetails(
    paymentId: string,
    authToken?: string
  ): Promise<any> {
    const config = this.buildAuthConfig(authToken);
    return await this.get(`/api/payments/${paymentId}`, config);
  }

  /**
   * Process refund
   */
  async processRefund(
    transactionId: string,
    reason: string,
    authToken?: string
  ): Promise<any> {
    const config = this.buildAuthConfig(authToken);
    return await this.post(
      `/api/payments/${transactionId}/refund`,
      { reason },
      config
    );
  }
}

export default new PaymentClient();