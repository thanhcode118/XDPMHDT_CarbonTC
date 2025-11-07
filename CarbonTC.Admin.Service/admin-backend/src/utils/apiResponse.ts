import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  statusCode: number;
  timestamp: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  statusCode: number;
  timestamp: string;
}

export class ApiResponseHelper {

  static success<T>(
    res: Response,
    data: T,
    message: string = 'Success',
    statusCode: number = 200
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
      statusCode,
      timestamp: new Date().toISOString()
    };
    return res.status(statusCode).json(response);
  }

  static error(
    res: Response,
    message: string = 'Error occurred',
    statusCode: number = 500,
    error?: string
  ): Response {
    const response: ApiResponse = {
      success: false,
      message,
      error,
      statusCode,
      timestamp: new Date().toISOString()
    };
    return res.status(statusCode).json(response);
  }

  static paginated<T>(
    res: Response,
    data: T[],
    currentPage: number,
    totalItems: number,
    itemsPerPage: number,
    message: string = 'Success',
    statusCode: number = 200
  ): Response {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    const response: PaginatedResponse<T> = {
      success: true,
      message,
      data,
      pagination: {
        currentPage,
        totalPages,
        totalItems,
        itemsPerPage,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1
      },
      statusCode,
      timestamp: new Date().toISOString()
    };
    
    return res.status(statusCode).json(response);
  }

  static created<T>(
    res: Response,
    data: T,
    message: string = 'Resource created successfully'
  ): Response {
    return this.success(res, data, message, 201);
  }

  static noContent(res: Response): Response {
    return res.status(204).send();
  }

  static badRequest(
    res: Response,
    message: string = 'Bad request',
    error?: string
  ): Response {
    return this.error(res, message, 400, error);
  }

  static unauthorized(
    res: Response,
    message: string = 'Unauthorized',
    error?: string
  ): Response {
    return this.error(res, message, 401, error);
  }

  static forbidden(
    res: Response,
    message: string = 'Forbidden',
    error?: string
  ): Response {
    return this.error(res, message, 403, error);
  }

  static notFound(
    res: Response,
    message: string = 'Resource not found',
    error?: string
  ): Response {
    return this.error(res, message, 404, error);
  }

  static conflict(
    res: Response,
    message: string = 'Conflict',
    error?: string
  ): Response {
    return this.error(res, message, 409, error);
  }

  static internalError(
    res: Response,
    message: string = 'Internal server error',
    error?: string
  ): Response {
    return this.error(res, message, 500, error);
  }
}

export default ApiResponseHelper;