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
   * @param userId - User ID
   * @param authToken - Optional auth token to forward
   */
  async getUserById(userId: string, authToken?: string): Promise<any> {
    try {
      const config = this.buildAuthConfig(authToken);
      return await this.get(`/api/users/${userId}`, config);
    } catch (error) {
      logger.error(`[Auth] Failed to get user ${userId}:`, error);
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
      logger.error('[Auth] Failed to get users by IDs:', error);
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
      logger.warn(`[Auth] Failed to check user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId: string, authToken?: string): Promise<any> {
    try {
      const config = this.buildAuthConfig(authToken);
      return await this.get(`/api/users/${userId}/profile`, config);
    } catch (error) {
      logger.error(`[Auth] Failed to get user profile ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get basic user info (id, name, email, role)
   * Used for enriching data in responses
   */
  async getUserBasicInfo(
    userId: string,
    authToken?: string
  ): Promise<{ 
    userId: string; 
    fullName: string; 
    email: string; 
    role?: string 
  } | null> {
    try {
      const config = this.buildAuthConfig(authToken);
      const user = await this.get(`/api/users/${userId}`, config);

      return {
        userId: user.userId || userId,
        fullName: user.fullName || 'Unknown User',
        email: user.email || '',
        role: user.role
      };
    } catch (error) {
      logger.warn(
        `[Auth] Failed to get basic info for user ${userId}, returning null:`,
        error
      );
      return null;
    }
  }

  /**
   * Validate JWT token
   */
  async validateToken(token: string): Promise<any> {
    try {
      const config = this.buildAuthConfig(token);
      return await this.post('/api/auth/validate', {}, config);
    } catch (error) {
      logger.error('[Auth] Token validation failed:', error);
      throw error;
    }
  }

  /**
   * Get user role
   */
  async getUserRole(userId: string, authToken?: string): Promise<string> {
    try {
      const config = this.buildAuthConfig(authToken);
      const user = await this.get(`/api/users/${userId}`, config);
      return user.role || 'USER';
    } catch (error) {
      logger.error(`[Auth] Failed to get user role for ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Block user account
   */
  async blockUser(
    userId: string,
    reason: string,
    authToken?: string
  ): Promise<any> {
    try {
      const config = this.buildAuthConfig(authToken);
      return await this.post(
        `/api/users/${userId}/block`,
        { reason },
        config
      );
    } catch (error) {
      logger.error(`[Auth] Failed to block user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Unblock user account
   */
  async unblockUser(userId: string, authToken?: string): Promise<any> {
    try {
      const config = this.buildAuthConfig(authToken);
      return await this.post(`/api/users/${userId}/unblock`, {}, config);
    } catch (error) {
      logger.error(`[Auth] Failed to unblock user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Update user status
   */
  async updateUserStatus(
    userId: string,
    status: 'Active' | 'Inactive' | 'Blocked',
    authToken?: string
  ): Promise<any> {
    try {
      const config = this.buildAuthConfig(authToken);
      return await this.patch(
        `/api/users/${userId}/status`,
        { status },
        config
      );
    } catch (error) {
      logger.error(`[Auth] Failed to update user status ${userId}:`, error);
      throw error;
    }
  }
}

export default new AuthClient();