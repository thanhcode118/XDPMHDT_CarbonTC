import { Response, NextFunction } from 'express';
import { AuthRequest, ForbiddenError, UnauthorizedError, UserRole } from '../types';
import logger from '../utils/logger';

/**
 * Middleware to check if user has required role(s)
 * Must be used after authenticate middleware
 */
export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      // Check if user has required role
      if (!allowedRoles.includes(req.user.role)) {
        logger.warn(
          `Access denied for user ${req.user.email} (${req.user.role}). Required roles: ${allowedRoles.join(', ')}`
        );
        throw new ForbiddenError(
          `Access denied. Required role(s): ${allowedRoles.join(', ')}`
        );
      }

      logger.debug(`Access granted for user ${req.user.email} (${req.user.role})`);
      next();

    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check if user is Admin
 * Shorthand for requireRole(UserRole.ADMIN)
 */
export const requireAdmin = requireRole(UserRole.ADMIN);

/**
 * Middleware to check if user is Admin or CVA
 * Useful for verification/audit operations
 */
export const requireAdminOrCVA = requireRole(UserRole.ADMIN, UserRole.CVA);

/**
 * Middleware to check if user can access their own resource
 * Allows access if user is Admin OR if userId matches the resource owner
 */
export const requireOwnerOrAdmin = (userIdParam: string = 'userId') => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const requestedUserId = req.params[userIdParam] || req.body[userIdParam];

      // Allow if user is admin
      if (req.user.role === UserRole.ADMIN) {
        logger.debug(`Admin access granted: ${req.user.email}`);
        return next();
      }

      // Allow if user is accessing their own resource
      if (req.user.userId === requestedUserId) {
        logger.debug(`Owner access granted: ${req.user.email}`);
        return next();
      }

      // Deny access
      logger.warn(
        `Access denied: User ${req.user.email} attempted to access resource of user ${requestedUserId}`
      );
      throw new ForbiddenError('You can only access your own resources');

    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check specific permissions
 * More granular than role-based access
 */
interface Permission {
  resource: string;
  action: 'read' | 'write' | 'delete' | 'admin';
}

// Define permissions for each role
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    { resource: '*', action: 'admin' } // Admin has all permissions
  ],
  [UserRole.CVA]: [
    { resource: 'disputes', action: 'read' },
    { resource: 'reports', action: 'read' },
    { resource: 'verification', action: 'write' }
  ],
  [UserRole.EV_OWNER]: [
    { resource: 'own-data', action: 'read' },
    { resource: 'own-data', action: 'write' }
  ],
  [UserRole.BUYER]: [
    { resource: 'marketplace', action: 'read' },
    { resource: 'transactions', action: 'write' }
  ]
};

export const requirePermission = (resource: string, action: Permission['action']) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const userPermissions = ROLE_PERMISSIONS[req.user.role];

      // Check if user has wildcard permission (admin)
      const hasWildcard = userPermissions.some(
        p => p.resource === '*' && p.action === 'admin'
      );

      if (hasWildcard) {
        return next();
      }

      // Check if user has specific permission
      const hasPermission = userPermissions.some(
        p => p.resource === resource && (p.action === action || p.action === 'admin')
      );

      if (!hasPermission) {
        logger.warn(
          `Permission denied: User ${req.user.email} (${req.user.role}) attempted ${action} on ${resource}`
        );
        throw new ForbiddenError(`You don't have permission to ${action} ${resource}`);
      }

      logger.debug(`Permission granted: ${req.user.email} can ${action} ${resource}`);
      next();

    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to log role-based access
 * Useful for audit trails
 */
export const logAccess = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user) {
    logger.info('Access log:', {
      userId: req.user.userId,
      email: req.user.email,
      role: req.user.role,
      method: req.method,
      path: req.path,
      ip: req.ip,
      timestamp: new Date().toISOString()
    });
  }
  next();
};