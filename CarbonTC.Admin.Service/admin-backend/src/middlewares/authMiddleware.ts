import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, UnauthorizedError, UserRole } from '../types';
import logger from '../utils/logger';

/**
 * Interface for JWT payload
 */
interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

/**
 * Middleware to verify JWT token
 * Extracts token from Authorization header (Bearer token)
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new UnauthorizedError('Invalid token format');
    }

    // Verify token
    const jwtSecret = process.env.JWT_SECRET;
    
    if (!jwtSecret) {
      logger.error('JWT_SECRET is not defined in environment variables');
      throw new Error('Server configuration error');
    }

    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      iat: decoded.iat,
      exp: decoded.exp
    };

    logger.debug(`User authenticated: ${decoded.email} (${decoded.role})`);
    next();

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid token'));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError('Token expired'));
    } else if (error instanceof UnauthorizedError) {
      next(error);
    } else {
      logger.error('Authentication error:', error);
      next(new UnauthorizedError('Authentication failed'));
    }
  }
};

/**
 * Optional authentication middleware
 * Does not throw error if no token is provided
 * Useful for routes that can work with or without authentication
 */
export const optionalAuthenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return next();
    }

    const jwtSecret = process.env.JWT_SECRET;
    
    if (!jwtSecret) {
      logger.error('JWT_SECRET is not defined in environment variables');
      return next();
    }

    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      iat: decoded.iat,
      exp: decoded.exp
    };

    next();

  } catch (error) {
    // Don't throw error, just continue without user info
    logger.debug('Optional authentication failed:', error);
    next();
  }
};

/**
 * Middleware to verify token using JWKS (for production)
 * This would fetch public key from Auth Service's JWKS endpoint
 */
export const authenticateWithJWKS = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.split(' ')[1];

    // In production, fetch public key from AUTH_SERVICE_URL/.well-known/jwks.json
    // For now, use JWT_PUBLIC_KEY from env
    const publicKey = process.env.JWT_PUBLIC_KEY || process.env.JWT_SECRET;
    
    if (!publicKey) {
      logger.error('JWT public key is not configured');
      throw new Error('Server configuration error');
    }

    const decoded = jwt.verify(token, publicKey) as JWTPayload;

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      iat: decoded.iat,
      exp: decoded.exp
    };

    logger.debug(`User authenticated via JWKS: ${decoded.email} (${decoded.role})`);
    next();

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid token'));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError('Token expired'));
    } else {
      logger.error('JWKS authentication error:', error);
      next(new UnauthorizedError('Authentication failed'));
    }
  }
};