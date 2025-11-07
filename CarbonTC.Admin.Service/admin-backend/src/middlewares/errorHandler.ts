import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types';
import logger from '../utils/logger';
import ApiResponseHelper from '../utils/apiResponse';

/**
 * Global error handling middleware
 * Must be placed after all routes
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): Response => {
  // Log the error
  logger.error('Error occurred:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: (req as any).user?.userId
  });

  // Check if error is an operational error
  if (err instanceof AppError) {
    return ApiResponseHelper.error(
      res,
      err.message,
      err.statusCode,
      process.env.NODE_ENV === 'development' ? err.stack : undefined
    );
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    return ApiResponseHelper.badRequest(
      res,
      'Validation error',
      err.message
    );
  }

  // Handle Mongoose duplicate key errors
  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    const field = Object.keys((err as any).keyPattern)[0];
    return ApiResponseHelper.conflict(
      res,
      `Duplicate value for field: ${field}`,
      'Resource already exists'
    );
  }

  // Handle Mongoose cast errors (invalid ObjectId)
  if (err.name === 'CastError') {
    return ApiResponseHelper.badRequest(
      res,
      'Invalid ID format',
      err.message
    );
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return ApiResponseHelper.unauthorized(
      res,
      'Invalid token',
      err.message
    );
  }

  if (err.name === 'TokenExpiredError') {
    return ApiResponseHelper.unauthorized(
      res,
      'Token expired',
      err.message
    );
  }

  // Handle syntax errors (malformed JSON)
  if (err instanceof SyntaxError && 'body' in err) {
    return ApiResponseHelper.badRequest(
      res,
      'Invalid JSON format',
      err.message
    );
  }

  // Default to 500 server error
  return ApiResponseHelper.internalError(
    res,
    'Internal server error',
    process.env.NODE_ENV === 'development' ? err.message : undefined
  );
};

/**
 * Async error wrapper to catch errors in async route handlers
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Not found handler (404)
 * Should be placed before error handler
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): Response => {
  return ApiResponseHelper.notFound(
    res,
    `Route ${req.method} ${req.path} not found`
  );
};