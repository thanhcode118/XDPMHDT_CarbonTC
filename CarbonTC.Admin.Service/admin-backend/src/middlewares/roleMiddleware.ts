import { Response, NextFunction } from 'express';
import { AuthRequest, ForbiddenError, UnauthorizedError, UserRole } from '../types';
import logger from '../utils/logger';

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

      logger.debug(`Access granted for user ${req.user.email} (${req.user.role}) 
        -> ${req.method} ${req.path}`);
      return next();

    } catch (error) {
      return next(error);
    }
  };
};

export const requireAdmin = requireRole(UserRole.ADMIN);

export const requireAdminOrCVA = requireRole(UserRole.ADMIN, UserRole.CVA);

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
      return next(error);
    }
  };
};

interface Permission {
  resource: string;
  action: 'read' | 'write' | 'delete' | 'admin';
}

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    { resource: '*', action: 'admin' }
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
      return next();

    } catch (error) {
      return next(error);
    }
  };
};

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