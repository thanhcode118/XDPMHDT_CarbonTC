import axios from 'axios';
import { BaseServiceClient } from './baseClient';
import logger from '../logger';

class MarketplaceClient extends BaseServiceClient {
  constructor() {
    super({
      baseURL: process.env.MARKETPLACE_SERVICE_URL || 'http://localhost:5003',
      serviceName: 'Marketplace Service'
    });
  }

  /**
   * Check if transaction exists
   */
  async checkTransactionExists(
    transactionId: string,
    authToken?: string
  ): Promise<boolean> {
    try {
      const config = this.buildAuthConfig(authToken);
      await this.client.get(`/api/transactions/${transactionId}`, config);
      return true;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return false;
      }
      logger.warn(
        `[Marketplace] Failed to check transaction ${transactionId}:`,
        error
      );
      return false;
    }
  }

  /**
   * Get transaction details
   */
  async getTransactionDetails(
    transactionId: string,
    authToken?: string
  ): Promise<any> {
    try {
      const config = this.buildAuthConfig(authToken);
      return await this.get(`/api/transactions/${transactionId}`, config);
    } catch (error) {
      logger.error(
        `[Marketplace] Failed to get transaction ${transactionId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get transaction by ID with full details
   */
  async getTransaction(
    transactionId: string,
    authToken?: string
  ): Promise<any> {
    const config = this.buildAuthConfig(authToken);
    return await this.get(`/api/transactions/${transactionId}`, config);
  }

  /**
   * Get listing details
   */
  async getListingDetails(
    listingId: string,
    authToken?: string
  ): Promise<any> {
    const config = this.buildAuthConfig(authToken);
    return await this.get(`/api/listings/${listingId}`, config);
  }

  /**
   * Check if listing exists
   */
  async checkListingExists(
    listingId: string,
    authToken?: string
  ): Promise<boolean> {
    try {
      const config = this.buildAuthConfig(authToken);
      await this.client.get(`/api/listings/${listingId}`, config);
      return true;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return false;
      }
      return false;
    }
  }

  /**
   * Get all transactions with filters
   */
  async getTransactions(
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
    return await this.get('/api/transactions', config);
  }
}

export default new MarketplaceClient();