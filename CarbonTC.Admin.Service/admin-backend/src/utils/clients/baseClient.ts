import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import logger from '../logger';

export interface ServiceClientConfig {
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
      timeout: config.timeout || parseInt(process.env.SERVICE_TIMEOUT || '5000'),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        logger.debug(`[${this.serviceName}] Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        logger.error(`[${this.serviceName}] Request Error:`, error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        logger.debug(`[${this.serviceName}] Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error: AxiosError) => {
        if (error.response) {
          logger.error(`[${this.serviceName}] Response Error: ${error.response.status}`, {
            url: error.config?.url,
            data: error.response.data,
            status: error.response.status
          });
        } else if (error.request) {
          logger.error(`[${this.serviceName}] No Response:`, {
            url: error.config?.url,
            message: error.message
          });
        } else {
          logger.error(`[${this.serviceName}] Error:`, error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  protected async get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  protected async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  protected async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  protected async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  protected async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  protected buildAuthConfig(authToken?: string): AxiosRequestConfig {
    if (!authToken) return {};
    
    return {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    };
  }
}