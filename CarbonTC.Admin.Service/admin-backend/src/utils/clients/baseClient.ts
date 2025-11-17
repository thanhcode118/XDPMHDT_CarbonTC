import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import logger from '../logger';

interface ServiceClientConfig {
  baseURL: string;
  serviceName: string;
  timeout?: number;
}

export class BaseServiceClient {
  protected client: AxiosInstance;
  protected serviceName: string;

  constructor(config: ServiceClientConfig) {
    this.serviceName = config.serviceName;
    
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        logger.debug(`[${this.serviceName}] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        logger.error(`[${this.serviceName}] Request error:`, error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        logger.debug(
          `[${this.serviceName}] Response ${response.status} from ${response.config.url}`
        );
        return response;
      },
      (error: AxiosError) => {
        if (error.response) {
          logger.error(
            `[${this.serviceName}] Response error ${error.response.status}:`,
            error.response.data
          );
        } else if (error.request) {
          logger.error(
            `[${this.serviceName}] No response received:`,
            error.message
          );
        } else {
          logger.error(`[${this.serviceName}] Request setup error:`, error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Build config with authorization token
   */
  protected buildAuthConfig(authToken?: string): AxiosRequestConfig {
    const config: AxiosRequestConfig = {
      headers: {},
    };

    if (authToken) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${authToken}`,
      };
    }

    return config;
  }

  /**
   * Generic GET request
   */
  protected async get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await this.client.get<T>(url, config);
      return response.data;
    } catch (error) {
      this.handleError(error, 'GET', url);
      throw error;
    }
  }

  /**
   * Generic POST request
   */
  protected async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await this.client.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      this.handleError(error, 'POST', url);
      throw error;
    }
  }

  /**
   * Generic PUT request
   */
  protected async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await this.client.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      this.handleError(error, 'PUT', url);
      throw error;
    }
  }

  /**
   * Generic PATCH request
   */
  protected async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await this.client.patch<T>(url, data, config);
      return response.data;
    } catch (error) {
      this.handleError(error, 'PATCH', url);
      throw error;
    }
  }

  /**
   * Generic DELETE request
   */
  protected async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await this.client.delete<T>(url, config);
      return response.data;
    } catch (error) {
      this.handleError(error, 'DELETE', url);
      throw error;
    }
  }

  /**
   * Handle errors consistently
   */
  private handleError(error: any, method: string, url: string): void {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;
      
      logger.error(
        `[${this.serviceName}] ${method} ${url} failed (${status}): ${message}`
      );
    } else {
      logger.error(
        `[${this.serviceName}] ${method} ${url} failed:`,
        error
      );
    }
  }

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.get('/health');
      return true;
    } catch (error) {
      logger.warn(`[${this.serviceName}] Health check failed`);
      return false;
    }
  }
}

export default BaseServiceClient;