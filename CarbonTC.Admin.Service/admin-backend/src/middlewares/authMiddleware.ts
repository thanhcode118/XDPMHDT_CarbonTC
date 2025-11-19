import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, UnauthorizedError, UserRole } from '../types';
import logger from '../utils/logger';

const DOTNET_CLAIMS = {
  USER_ID: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier',
  EMAIL: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
  ROLE: 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
};

interface JWTPayload {
  // userId?: string;
  // email?: string;
  // role?: string;
  [key: string ]: any;
  iat?: number;
  exp?: number;
}

const roleMap: Record<string, UserRole> = {
  'Admin': UserRole.ADMIN,
  'ADMIN': UserRole.ADMIN,
  'CVA': UserRole.CVA,
  'EVOwner': UserRole.EV_OWNER,
  'EV_OWNER': UserRole.EV_OWNER,
  'Buyer': UserRole.BUYER,
  'BUYER': UserRole.BUYER,
  'CreditBuyer': UserRole.BUYER,  
  'CREDIT_BUYER': UserRole.BUYER
};

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.split(' ')[1];
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      logger.error('JWT_SECRET is not defined in environment variables');
      throw new Error('Server configuration error');
    }

    const payload = jwt.verify(token, jwtSecret, {
      algorithms: ["HS256"],
      issuer: process.env.AUTH_ISS || "CarbonTC.Auth",
      audience: process.env.AUTH_AUD || "CarbonTC.Services",
    }) as JWTPayload;

    const userId = payload[DOTNET_CLAIMS.USER_ID] || payload.userId;
    const email = payload[DOTNET_CLAIMS.EMAIL] || payload.email;
    const roleString = payload[DOTNET_CLAIMS.ROLE] || payload.role || payload.roleName;
    if (!userId || !email || !roleString) {
      throw new UnauthorizedError('Token is missing required user information');
    }

    const role = roleMap[roleString];
    if (!role) {
      throw new UnauthorizedError('User role is not authorized');
    }
    req.user = {
      userId,
      email,
      role,
      iat: payload.iat,
      exp: payload.exp
    };

    logger.debug(`User authenticated: ${email} (${role})`);
    return next();

  } catch (error) {
    if (error instanceof jwt.TokenExpiredError)
      return next(new UnauthorizedError("Token expired"));
    if (error instanceof jwt.JsonWebTokenError)
      return next(new UnauthorizedError("Invalid token"));
    logger.error('Authentication error:', error);
    return next(new UnauthorizedError('Authentication failed'));
  }
};

export const optionalAuthenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      logger.error('JWT_SECRET is not defined');
      return next();
    }

    const payload = jwt.verify(token, jwtSecret, {
      algorithms: ["HS256"],
      issuer: process.env.AUTH_ISS || "CarbonTC.Auth",
      audience: process.env.AUTH_AUD || "CarbonTC.Services",
    }) as JWTPayload;

    const userId = payload.userId || payload[DOTNET_CLAIMS.USER_ID];
    const email = payload.email || payload[DOTNET_CLAIMS.EMAIL];
    const roleString = payload.role || payload.roleName || payload[DOTNET_CLAIMS.ROLE];
    if (!userId || !email || !roleString) {
      return next();
    }

    const role = roleMap[roleString];
    if (!role) {
      logger.debug(`invalid role in optional authentication: ${roleString}`);
      return next();
    }

    req.user = {
      userId,
      email,
      role,
      iat: payload.iat,
      exp: payload.exp
    };

    return next();
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
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.split(' ')[1];
    const publicKey = process.env.JWT_PUBLIC_KEY || process.env.JWT_SECRET;
    
    if (!publicKey) {
      logger.error('JWT public key is not configured');
      throw new Error('Server configuration error');
    }

    const payload = jwt.verify(token, publicKey, {
      algorithms: process.env.JWT_PUBLIC_KEY ? ["RS256"] : ["HS256"],
      issuer: process.env.AUTH_ISS || "CarbonTC.Auth",
      audience: process.env.AUTH_AUD || "CarbonTC.Services",
    }) as JWTPayload;

    const userId = payload.userId || payload[DOTNET_CLAIMS.USER_ID];
    const email = payload.email || payload[DOTNET_CLAIMS.EMAIL];
    const roleString = payload.role || payload.roleName || payload[DOTNET_CLAIMS.ROLE];
    if (!userId || !email || !roleString) {
      throw new UnauthorizedError('Token is missing required user information');
    }

    const role = roleMap[roleString];
    if (!role) {
      throw new UnauthorizedError('User role is not authorized');
    }

    req.user = {
      userId,
      email,
      role,
      iat: payload.iat,
      exp: payload.exp
    };

    logger.debug(`User authenticated via JWKS: ${email} (${role})`);
    return next();

  } catch (error) {
    if (error instanceof jwt.TokenExpiredError)
      return next(new UnauthorizedError("Token expired"));
    if (error instanceof jwt.JsonWebTokenError)
      return next(new UnauthorizedError("Invalid token"));
    logger.error('JWKS authentication error:', error);
    return next(new UnauthorizedError('Authentication failed'));
  }
};