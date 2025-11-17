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
   * Get user by ID
   */
  async getUserById(
    userId: string,
    authToken?: string
  ): Promise<any> {
    try {
      const config = this.buildAuthConfig(authToken);
      return await this.get(`/api/users/${userId}`, config);
    } catch (error) {
      logger.error(
        `[Auth] Failed to get user ${userId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get multiple users by IDs
   */
  async getUsersByIds(
    userIds: string[],
    authToken?: string
  ): Promise<any[]> {
    try {
      const config = this.buildAuthConfig(authToken);
      config.params = { ids: userIds.join(',') };
      return await this.get('/api/users/batch', config);
    } catch (error) {
      logger.error(
        `[Auth] Failed to get users:`,
        error
      );
      throw error;
    }
  }

  /**
   * Check if user exists
   */
  async checkUserExists(
    userId: string,
    authToken?: string
  ): Promise<boolean> {
    try {
      const config = this.buildAuthConfig(authToken);
      await this.client.get(`/api/users/${userId}`, config);
      return true;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return false;
      }
      logger.warn(
        `[Auth] Failed to check user ${userId}:`,
        error
      );
      return false;
    }
  }

  /**
   * Get user profile details
   */
  async getUserProfile(
    userId: string,
    authToken?: string
  ): Promise<any> {
    try {
      const config = this.buildAuthConfig(authToken);
      return await this.get(`/api/users/${userId}/profile`, config);
    } catch (error) {
      logger.error(
        `[Auth] Failed to get user profile ${userId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get user basic info (lightweight)
   */
  async getUserBasicInfo(
    userId: string,
    authToken?: string
  ): Promise<{ userId: string; fullName?: string; email?: string } | null> {
    try {
      const user = await this.getUserById(userId, authToken);
      return {
        userId: user.userId || userId,
        fullName: user.fullName || user.name,
        email: user.email
      };
    } catch (error) {
      logger.warn(
        `[Auth] Failed to get basic info for user ${userId}, returning null:`,
        error
      );
      return null;
    }
  }
}

export default new AuthClient();