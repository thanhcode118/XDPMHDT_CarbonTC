import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, UnauthorizedError, UserRole } from '../types';
import logger from '../utils/logger';

interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export const authenticate = async (
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
    if (!token) {
      throw new UnauthorizedError('Invalid token format');
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      logger.error('JWT_SECRET is not defined in environment variables');
      throw new Error('Server configuration error');
    }

    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
    if (!Object.values(UserRole).includes(decoded.role)) {
      throw new UnauthorizedError('User role is not authorized');
    }

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      iat: decoded.iat,
      exp: decoded.exp
    };

    logger.debug(`User authenticated: ${decoded.email} (${decoded.role})`);
    return next();

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new UnauthorizedError('Invalid token'));
    } else if (error instanceof jwt.TokenExpiredError) {
      return next(new UnauthorizedError('Token expired'));
    } else if (error instanceof UnauthorizedError) {
      return next(error);
    } else {
      logger.error('Authentication error:', error);
      return next(new UnauthorizedError('Authentication failed'));
    }
  }
};

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
      logger.error('JWT_SECRET is not defined');
      return next();
    }

    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;

    if (!Object.values(UserRole).includes(decoded.role)) {
      logger.warn(`invalid role in optional authentication: ${decoded.role}`);
      return next();
    }

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      iat: decoded.iat,
      exp: decoded.exp
    };

    next();

  } catch (error) {
    logger.debug('Optional authentication failed:', error);
    return next();
  }
};

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
    const publicKey = process.env.JWT_PUBLIC_KEY || process.env.JWT_SECRET;
    
    if (!publicKey) {
      logger.error('JWT public key is not configured');
      throw new Error('Server configuration error');
    }

    const decoded = jwt.verify(token, publicKey) as JWTPayload;

    if (!Object.values(UserRole).includes(decoded.role)) {
      throw new UnauthorizedError('User role is not authorized');
    }

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      iat: decoded.iat,
      exp: decoded.exp
    };

    logger.debug(`User authenticated via JWKS: ${decoded.email} (${decoded.role})`);
    return next();

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new UnauthorizedError('Invalid token'));
    } else if (error instanceof jwt.TokenExpiredError) {
      return next(new UnauthorizedError('Token expired'));
    } else {
      logger.error('JWKS authentication error:', error);
      return next(new UnauthorizedError('Authentication failed'));
    }
  }
};