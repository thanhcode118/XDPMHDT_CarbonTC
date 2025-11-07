import axios from 'axios';
import { BaseServiceClient } from './baseClient';
import logger from '../logger';

class AuthClient extends BaseServiceClient {
  constructor() {
    super({
      baseURL: process.env.AUTH_SERVICE_URL || 'http://localhost:5001',
      serviceName: 'Auth Service'
    });
  }

  /**
   * Get user details by ID
   */
  async getUserDetails(userId: string, authToken?: string): Promise<any> {
    try {
      const config = this.buildAuthConfig(authToken);
      return await this.get(`/api/users/${userId}`, config);
    } catch (error) {
      logger.error(`[Auth] Failed to get user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Check if user exists
   */
  async checkUserExists(userId: string, authToken?: string): Promise<boolean> {
    try {
      const config = this.buildAuthConfig(authToken);
      await this.client.get(`/api/users/${userId}`, config);
      return true;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return false;
      }
      logger.warn(`[Auth] Failed to check user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId: string, authToken?: string): Promise<any> {
    const config = this.buildAuthConfig(authToken);
    return await this.get(`/api/users/${userId}/profile`, config);
  }

  /**
   * Get multiple users
   */
  async getUsers(
    filters?: {
      page?: number;
      limit?: number;
      role?: string;
      status?: string;
    },
    authToken?: string
  ): Promise<any> {
    const config = this.buildAuthConfig(authToken);
    config.params = filters;
    return await this.get('/api/users', config);
  }

  /**
   * Verify JWT token (if Auth Service has this endpoint)
   */
  async verifyToken(token: string): Promise<any> {
    return await this.post('/api/auth/verify', { token });
  }

  /**
   * Block user (Admin action via Auth Service)
   */
  async blockUser(userId: string, reason: string, authToken?: string): Promise<any> {
    const config = this.buildAuthConfig(authToken);
    return await this.post(
      `/api/users/${userId}/block`,
      { reason },
      config
    );
  }

  /**
   * Unblock user
   */
  async unblockUser(userId: string, authToken?: string): Promise<any> {
    const config = this.buildAuthConfig(authToken);
    return await this.post(`/api/users/${userId}/unblock`, {}, config);
  }
}

export default new AuthClient();