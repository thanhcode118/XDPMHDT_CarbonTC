import { Response, NextFunction } from 'express';
import { 
  AuthRequest, 
  ForbiddenError, 
  UnauthorizedError, 
  UserRole 
} from '../types';
import logger from '../utils/logger';

const normalizeRole = (role: string): string => role?.toLowerCase();

export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }
      const userRole = normalizeRole(req.user.role);
      const allowed = allowedRoles.map((r) => normalizeRole(r));

      // Check if user has required role
      if (!allowed.includes(userRole)) {
        logger.warn(
          `Access denied for user ${req.user.email} (${req.user.role}). Required roles: ${allowedRoles.join(', ')}`
        );
        throw new ForbiddenError(
          `Access denied. Required role(s): ${allowedRoles.join(', ')}`
        );
      }

      logger.debug(`Access granted for user 
        ${req.user.email} (${req.user.role}) -> ${req.method} ${req.path}`);
      return next();

    } catch (error) {
      return next(error);
    }
  };
};

export const requireAdmin = requireRole(UserRole.ADMIN);
export const requireAdminOrCVA = requireRole(UserRole.ADMIN, UserRole.CVA);

export const requireOwnerOrAdmin = (userIdParam: string = 'userId') => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const requestedUserId = req.params[userIdParam] || req.body[userIdParam];
      const userRole = normalizeRole(req.user.role);
      // Allow if user is admin
      if (userRole === normalizeRole(UserRole.ADMIN)) {
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
        `Access denied: User ${req.user.email} tried to access ${requestedUserId}`
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
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }
      const userRole = req.user.role;
      const userPermissions = ROLE_PERMISSIONS[userRole] || [];

      const hasAdmin = userPermissions.some(
        (p) => p.resource === "*" && p.action === "admin"
      );

      if (hasAdmin) return next();

      // Check if user has specific permission
      const hasPermission = userPermissions.some(
        p => p.resource === resource && (p.action === action || p.action === 'admin')
      );

      if (!hasPermission) {
        logger.warn(
          `Permission denied: User ${req.user.email} (${req.user.role}) -> ${action} ${resource}`
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

export const logAccess = (req: AuthRequest, _res: Response, next: NextFunction): void => {
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