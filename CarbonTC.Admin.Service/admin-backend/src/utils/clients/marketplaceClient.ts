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
      await this.client.get(`/api/Transaction/${transactionId}`, config);
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
      return await this.get(`/api/Transaction/${transactionId}`, config);
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
    try {
      const config = this.buildAuthConfig(authToken);
      return await this.get(`/api/listings/${listingId}`, config);
    } catch (error) {
      logger.error(
        `[Marketplace] Failed to get listing ${listingId}:`,
        error
      );
      throw error;
    }
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

  async getListings(
    filters?: {
      page?: number;
      limit?: number;
      status?: string;
      ownerId?: string;
    },
    authToken?: string
  ): Promise<any> {
    try {
      const config = this.buildAuthConfig(authToken);
      config.params = filters;
      return await this.get('/api/listings', config);
    } catch (error) {
      logger.error('[Marketplace] Failed to get listings:', error);
      throw error;
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
      transactionId?: string;
    },
    authToken?: string
  ): Promise<any> {
    try {
      const config = this.buildAuthConfig(authToken);
      config.params = filters;
      return await this.get('/api/Transaction', config);
    } catch (error) {
      logger.error('[Marketplace] Failed to get transactions:', error);
      throw error;
    }
  }

  async updateTransactionStatusViaEvent(
    transactionId: string,
    status: string,
    notes?: string
  ): Promise<void> {
    // This is handled via RabbitMQ, not HTTP
    logger.info(
      `[Marketplace] Transaction status update will be sent via RabbitMQ - Transaction: ${transactionId}, Status: ${status}`
    );
  }
}

export default new MarketplaceClient();